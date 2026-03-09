const jwt = require("jsonwebtoken");
const fs = require("fs");
const crypto = require("crypto");
const prisma = require("../config/database");
const {
  hashPassword,
  comparePassword,
  generateOTP,
  generateDeviceToken,
  hashDeviceToken,
} = require("../utils/hashUtil");
const { sendOTPEmail, sendPasswordResetEmail } = require("../utils/emailUtil");

// ─── Pending Registrations Store ────────────────────────────────────────────
const pendingRegistrations = new Map();
const PENDING_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Password Reset Token Store ─────────────────────────────────────────────
const passwordResetTokens = new Map();
const passwordResetByEmail = new Map();
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function invalidateResetToken(email) {
  const oldToken = passwordResetByEmail.get(email);
  if (oldToken) {
    passwordResetTokens.delete(oldToken);
    passwordResetByEmail.delete(email);
  }
}

// ─── Pending Registration Helpers ───────────────────────────────────────────

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
    cleanupTempFiles(entry);
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

// ─── Auth Service ────────────────────────────────────────────────────────────

const authService = {
  /**
   * Step 1 of registration: validate uniqueness, store pending data
   * (including multer temp file paths), and send a verification OTP.
   * The user record is NOT written to the DB yet.
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
      cleanupTempFiles({ filePaths: files.map((f) => ({ path: f.path })) });
      throw new Error("User with this email already exists");
    }

    if (getPendingRegistration(email)) {
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
   * Returns the raw deviceToken so the client can store it and pass it
   * on every future POST /login request — skipping OTP on known devices.
   */
  async verifyRegistrationOTP(email, otpCode, parentsService) {
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
      throw new Error("Invalid or expired OTP");
    }

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

    // Issue the first trusted device token — client stores this raw value
    // and sends it with every POST /login going forward
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

  // ─── Login ─────────────────────────────────────────────────────────────────
  /**
   * POST /auth/login
   *
   * Requires email + password + deviceToken.
   * Always returns a JWT when all three are valid.
   *
   * ┌─────────────────────────────────────────────────────────────────────┐
   * │  FIRST LOGIN / NEW DEVICE (no deviceToken yet)                      │
   * │                                                                     │
   * │  1. POST /auth/send-otp   { email }                                 │
   * │  2. POST /auth/verify-otp { email, otpCode }                        │
   * │     ← returns { token, user, deviceToken }                          │
   * │  3. Store deviceToken in the client (localStorage / secure store)   │
   * │  4. All future logins use POST /auth/login with that deviceToken     │
   * └─────────────────────────────────────────────────────────────────────┘
   *
   * Errors:
   *   "Invalid email or password"            — wrong credentials
   *   "Account is inactive"                  — not yet activated by admin
   *   "Device token is required"             — field missing from body
   *   "Unrecognized device. Please complete OTP verification."
   *                                          — token not in trusted table
   */
  async login(email, password, deviceToken) {
    // 1. Validate credentials
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

    // 2. Require a device token — clients without one must go through OTP first
    if (!deviceToken) {
      throw new Error("Device token is required");
    }

    // 3. Verify the device token against trusted devices
    const hashedToken = hashDeviceToken(deviceToken);
    const trustedDevice = await prisma.userTrustedDevice.findFirst({
      where: { user_id: user.user_id, device_token: hashedToken },
    });

    if (!trustedDevice) {
      throw new Error(
        "Unrecognized device. Please complete OTP verification to register this device.",
      );
    }

    // 4. Refresh last_used_at timestamp
    await prisma.userTrustedDevice.update({
      where: { td_id: trustedDevice.td_id },
      data: { last_used_at: new Date() },
    });

    // 5. Issue and return JWT
    const token = signToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  },

  // ─── OTP — New Device Registration ──────────────────────────────────────────
  /**
   * Step 1: Send OTP to the user's email.
   * Used when the client has no deviceToken (first login or new device).
   */
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
   * Step 2: Verify OTP, issue JWT, and register this as a trusted device.
   *
   * Returns { token, user, deviceToken }.
   * The client MUST persist the raw deviceToken and include it in all
   * future POST /auth/login requests.
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

  // ─── Password Reset ────────────────────────────────────────────────────────

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return true; // silent — do not reveal whether email exists

    invalidateResetToken(email);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;

    passwordResetTokens.set(rawToken, { email, expiresAt });
    passwordResetByEmail.set(email, rawToken);

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;

    const emailSent = await sendPasswordResetEmail(email, resetLink);
    if (!emailSent) {
      passwordResetTokens.delete(rawToken);
      passwordResetByEmail.delete(email);
      throw new Error("Failed to send password reset email");
    }

    return true;
  },

  async resetPassword(token, newPassword) {
    const entry = passwordResetTokens.get(token);

    if (!entry) {
      throw new Error("Invalid or expired reset token");
    }

    if (Date.now() > entry.expiresAt) {
      passwordResetTokens.delete(token);
      passwordResetByEmail.delete(entry.email);
      throw new Error("Invalid or expired reset token");
    }

    const user = await prisma.user.findUnique({
      where: { email: entry.email },
    });
    if (!user) {
      passwordResetTokens.delete(token);
      passwordResetByEmail.delete(entry.email);
      throw new Error("User not found");
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password: hashedPassword },
    });

    passwordResetTokens.delete(token);
    passwordResetByEmail.delete(entry.email);

    return true;
  },

  // ─── Trusted Devices ──────────────────────────────────────────────────────

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
