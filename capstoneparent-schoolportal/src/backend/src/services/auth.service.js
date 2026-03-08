const jwt = require("jsonwebtoken");
const fs = require("fs");
const prisma = require("../config/database");
const {
  hashPassword,
  comparePassword,
  generateOTP,
  generateDeviceToken,
  hashDeviceToken,
} = require("../utils/hashUtil");
const { sendOTPEmail } = require("../utils/emailUtil");

// Temporary store for pending registrations (keyed by email, TTL = 10 min)
const pendingRegistrations = new Map();

const PENDING_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Delete all multer temp files stored in a pending registration entry.
 * Called on expiry, wrong OTP, or any failure after files were stored.
 * Silent — a missing temp file is not an error.
 */
function cleanupTempFiles(pending) {
  if (!pending?.filePaths?.length) return;
  for (const f of pending.filePaths) {
    try {
      if (f.path) fs.unlinkSync(f.path);
    } catch (_) {}
  }
}

function storePendingRegistration(email, data) {
  pendingRegistrations.set(email, {
    ...data,
    expiresAt: Date.now() + PENDING_TTL_MS,
  });
}

function getPendingRegistration(email) {
  const entry = pendingRegistrations.get(email);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cleanupTempFiles(entry); // ← clean up temp files before dropping the entry
    pendingRegistrations.delete(email);
    return null;
  }
  return entry;
}

function clearPendingRegistration(email) {
  pendingRegistrations.delete(email);
}

/** Sign a JWT for a given user */
function signToken(user) {
  return jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" },
  );
}

const authService = {
  /**
   * Step 1 of registration: validate uniqueness, store pending data
   * (including multer temp file paths), and send a verification OTP.
   * The user record is NOT written to the DB yet.
   *
   * Parent-specific validation: student_ids and at least one file are
   * required when role is "Parent" (or when student_ids is supplied,
   * which implies a parent registration).
   */
  async initiateRegistration(userData, files = []) {
    const {
      email,
      password,
      fname,
      lname,
      contact_num,
      address,
      role,
      student_ids,
    } = userData;

    const resolvedRole = role || (student_ids ? "Parent" : undefined);

    // Parents must supply at least one student and at least one supporting file
    if (resolvedRole === "Parent") {
      if (!student_ids || student_ids.length === 0) {
        throw new Error("Parents must provide at least one student ID");
      }
      if (!files || files.length === 0) {
        throw new Error("Parents must upload at least one supporting document");
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      // Clean up any uploaded temp files — they will never be used
      cleanupTempFiles({ filePaths: files.map((f) => ({ path: f.path })) });
      throw new Error("User with this email already exists");
    }

    if (getPendingRegistration(email)) {
      // Clean up newly uploaded temp files — a pending entry already holds
      // a previous set of temp files for this email
      cleanupTempFiles({ filePaths: files.map((f) => ({ path: f.path })) });
      throw new Error(
        "A verification email was already sent. Please check your inbox.",
      );
    }

    const hashedPassword = await hashPassword(password);
    const otpCode = generateOTP();
    const otpExpiresAt = Date.now() + PENDING_TTL_MS;

    storePendingRegistration(email, {
      email,
      hashedPassword,
      fname,
      lname,
      contact_num,
      address,
      role: resolvedRole,
      student_ids,
      otpCode,
      otpExpiresAt,
      // Store file metadata including the temp path so we can
      // (a) upload to Supabase on OTP verification, and
      // (b) clean up temp files on expiry or failure
      filePaths: files.map((f) => ({
        originalname: f.originalname,
        path: f.path,
        mimetype: f.mimetype,
        size: f.size,
      })),
    });

    const emailSent = await sendOTPEmail(email, otpCode);
    if (!emailSent) {
      cleanupTempFiles(getPendingRegistration(email));
      clearPendingRegistration(email);
      throw new Error("Failed to send OTP email");
    }

    return {
      message:
        "Verification OTP sent. Please verify your email to complete registration.",
    };
  },

  /**
   * Step 2 of registration: verify OTP then finalise account creation.
   *
   * The existingUser check is intentionally placed BEFORE the pending check
   * so that retries (lost response, double-submit) return the correct error
   * instead of "No pending registration found".
   *
   * DB write order is dictated by FK constraints:
   *   1. prisma.user.create
   *   2. prisma.userRole_Model.create     (user_id FK → step 1)
   *   3. parentsService.createFiles       (uploaded_by FK → step 1)
   *   4. parentsService.submitRegistration (parent_id FK → step 1,
   *                                         file_id FK → step 3)
   *   5. prisma.userTrustedDevice.create  (user_id FK → step 1)
   *
   * Returns the RAW deviceToken to the client; only the hash is stored in DB.
   */
  async verifyRegistrationOTP(email, otpCode, parentsService) {
    // Check this FIRST — handles retries where the 1st call succeeded
    // but the response was lost (double-submit, network drop, etc.)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Email already registered. Please log in instead.");
    }

    const pending = getPendingRegistration(email);
    if (!pending) {
      throw new Error(
        "No pending registration found or it has expired. Please register again.",
      );
    }

    if (Date.now() > pending.otpExpiresAt) {
      cleanupTempFiles(pending);
      clearPendingRegistration(email);
      throw new Error("Invalid or expired OTP");
    }

    if (pending.otpCode !== otpCode) {
      // Do NOT clean up temp files here — the user may retry with the correct OTP
      throw new Error("Invalid or expired OTP");
    }

    // Clear the pending entry immediately after the OTP is accepted so that
    // a second submission of the same OTP finds no pending entry and gets
    // "No pending registration found" instead of racing into prisma.user.create.
    // NOTE: temp files are NOT cleaned up here — they are still needed for upload.
    clearPendingRegistration(email);

    const user = await prisma.user.create({
      data: {
        email: pending.email,
        password: pending.hashedPassword,
        fname: pending.fname,
        lname: pending.lname,
        contact_num: pending.contact_num,
        address: pending.address,
        account_status: "Inactive",
      },
      select: {
        user_id: true,
        email: true,
        fname: true,
        lname: true,
        contact_num: true,
        address: true,
        account_status: true,
        created_at: true,
      },
    });

    if (pending.role) {
      await prisma.userRole_Model.create({
        data: { user_id: user.user_id, role: pending.role },
      });
    }

    if (pending.role === "Parent" && pending.student_ids && parentsService) {
      let file_ids;

      if (pending.filePaths && pending.filePaths.length > 0) {
        // createFiles uploads all files to Supabase in parallel and persists
        // File rows in a single DB round-trip. Temp files are deleted by
        // uploadFile() after each successful Supabase upload.
        const created = await parentsService.createFiles(
          pending.filePaths,
          user.user_id,
        );
        file_ids = created.map((f) => f.file_id);
      }

      await parentsService.submitRegistration({
        parent_id: user.user_id,
        student_ids: pending.student_ids,
        file_ids,
      });
    }

    // Generate raw token for client; store only the hash in DB
    const rawToken = generateDeviceToken();
    await prisma.userTrustedDevice.create({
      data: {
        user_id: user.user_id,
        device_token: hashDeviceToken(rawToken),
        last_used_at: new Date(),
      },
    });

    return {
      user,
      deviceToken: rawToken,
      message:
        "Email verified. Your account has been created and is pending activation by an administrator.",
    };
  },

  /**
   * Login flow:
   *   - Always validate email + password first.
   *   - If a deviceToken is supplied and matches a trusted device in the DB,
   *     issue a JWT immediately (trusted device bypass).
   *   - Otherwise return { requiresOTP: true } — the client must complete
   *     the OTP challenge via POST /send-otp then POST /verify-otp.
   */
  async login(email, password, deviceToken) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.account_status === "Inactive") {
      throw new Error(
        "Account is inactive. Please wait for an administrator to activate your account.",
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Check for a matching trusted device
    if (deviceToken) {
      const hashedToken = hashDeviceToken(deviceToken);
      const trustedDevice = await prisma.userTrustedDevice.findFirst({
        where: { user_id: user.user_id, device_token: hashedToken },
      });

      if (trustedDevice) {
        // Refresh last_used_at
        await prisma.userTrustedDevice.update({
          where: { td_id: trustedDevice.td_id },
          data: { last_used_at: new Date() },
        });

        const token = signToken(user);
        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
      }
    }

    // No valid trusted device — caller must complete OTP
    return { requiresOTP: true };
  },

  async sendOTP(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.userOTPCode.create({
      data: { user_id: user.user_id, otp_code: otpCode, expires_at: expiresAt },
    });

    const emailSent = await sendOTPEmail(email, otpCode);
    if (!emailSent) {
      throw new Error("Failed to send OTP email");
    }

    return true;
  },

  /**
   * Verify OTP, issue a JWT, and register a new trusted device.
   * Returns the RAW deviceToken to the client; the hash is stored in DB.
   */
  async verifyOTP(email, otpCode) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const otp = await prisma.userOTPCode.findFirst({
      where: {
        user_id: user.user_id,
        otp_code: otpCode,
        used: false,
        expires_at: { gt: new Date() },
      },
    });
    if (!otp) {
      throw new Error("Invalid or expired OTP");
    }

    await prisma.userOTPCode.update({
      where: { otp_id: otp.otp_id },
      data: { used: true },
    });

    // Register this device as trusted
    const rawToken = generateDeviceToken();
    await prisma.userTrustedDevice.create({
      data: {
        user_id: user.user_id,
        device_token: hashDeviceToken(rawToken),
        last_used_at: new Date(),
      },
    });

    const token = signToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword, deviceToken: rawToken };
  },

  async getTrustedDevices(userId) {
    return prisma.userTrustedDevice.findMany({
      where: { user_id: userId },
      orderBy: { last_used_at: "desc" },
    });
  },

  async removeTrustedDevice(userId, tdId) {
    const device = await prisma.userTrustedDevice.findFirst({
      where: { td_id: tdId, user_id: userId },
    });
    if (!device) throw new Error("Trusted device not found");

    await prisma.userTrustedDevice.delete({
      where: { td_id: tdId, user_id: userId },
    });
    return true;
  },
};

module.exports = authService;
