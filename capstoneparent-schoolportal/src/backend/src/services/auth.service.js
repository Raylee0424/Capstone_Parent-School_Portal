const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const {
  hashPassword,
  comparePassword,
  generateOTP,
  generateDeviceToken,
} = require("../utils/hashUtil");
const { sendOTPEmail } = require("../utils/emailUtil");

// Temporary store for pending registrations (keyed by email, TTL = 10 min)
// For production, replace this with a DB table (e.g. PendingRegistration)
const pendingRegistrations = new Map();

const PENDING_TTL_MS = 10 * 60 * 1000; // 10 minutes

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
    pendingRegistrations.delete(email);
    return null;
  }
  return entry;
}

function clearPendingRegistration(email) {
  pendingRegistrations.delete(email);
}

const authService = {
  /**
   * Step 1 of registration: validate uniqueness, persist files if any,
   * store data temporarily, and send a verification OTP.
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

    // Reject if a confirmed account already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Also reject if a non-expired pending registration already exists
    if (getPendingRegistration(email)) {
      throw new Error(
        "A verification email was already sent. Please check your inbox.",
      );
    }

    // Hash password now so we don't store plaintext in the pending map
    const hashedPassword = await hashPassword(password);

    // Store pending data (files are kept on disk; we store their paths)
    storePendingRegistration(email, {
      email,
      hashedPassword,
      fname,
      lname,
      contact_num,
      address,
      role: role || (student_ids ? "Parent" : undefined),
      student_ids,
      filePaths: files.map((f) => ({
        originalname: f.originalname,
        path: f.path,
        mimetype: f.mimetype,
        size: f.size,
      })),
    });

    // Send OTP for email verification
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + PENDING_TTL_MS);

    // We can't link to a user_id yet, so store with a special sentinel
    // Use a separate table or reuse UserOTPCode with a nullable user_id.
    // Here we store the OTP in a standalone pending_otp table or in-memory.
    // For simplicity (and to avoid schema changes), we store it in-memory too.
    storePendingRegistration(email, {
      ...getPendingRegistration(email),
      otpCode,
      otpExpiresAt: expiresAt.getTime(),
    });

    const emailSent = await sendOTPEmail(email, otpCode);
    if (!emailSent) {
      clearPendingRegistration(email);
      throw new Error("Failed to send OTP email");
    }

    return {
      message:
        "Verification OTP sent. Please verify your email to complete registration.",
    };
  },

  /**
   * Step 2 of registration: verify OTP then create the account as Inactive.
   * Returns a deviceToken so the client can proceed to login once activated.
   */
  async verifyRegistrationOTP(email, otpCode, parentsService) {
    const pending = getPendingRegistration(email);
    if (!pending) {
      throw new Error(
        "No pending registration found or it has expired. Please register again.",
      );
    }

    if (Date.now() > pending.otpExpiresAt) {
      clearPendingRegistration(email);
      throw new Error("Invalid or expired OTP");
    }

    if (pending.otpCode !== otpCode) {
      throw new Error("Invalid or expired OTP");
    }

    // --- Create the user record ---
    const user = await prisma.user.create({
      data: {
        email: pending.email,
        password: pending.hashedPassword,
        fname: pending.fname,
        lname: pending.lname,
        contact_num: pending.contact_num,
        address: pending.address,
        // All newly verified accounts start as Inactive; admin/teacher activates them
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

    // Assign role
    if (pending.role) {
      await prisma.userRole_Model.create({
        data: { user_id: user.user_id, role: pending.role },
      });
    }

    // Handle parent-specific registration (files + student links)
    if (pending.role === "Parent" && pending.student_ids && parentsService) {
      let file_ids;
      if (pending.filePaths.length > 0) {
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

    // Clean up pending data
    clearPendingRegistration(email);

    // Generate a trusted device token for this verified device
    const deviceToken = generateDeviceToken();
    await prisma.userTrustedDevice.create({
      data: {
        user_id: user.user_id,
        device_token: deviceToken,
        last_used_at: new Date(),
      },
    });

    return {
      user,
      deviceToken,
      message:
        "Email verified. Your account has been created and is pending activation by an administrator.",
    };
  },

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

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    if (deviceToken) {
      await prisma.userTrustedDevice.upsert({
        where: { device_token: deviceToken },
        update: { last_used_at: new Date() },
        create: {
          user_id: user.user_id,
          device_token: deviceToken,
          last_used_at: new Date(),
        },
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
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

  async verifyOTP(email, otpCode) {
    const user = await prisma.user.findUnique({ where: { email } });
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

    const deviceToken = generateDeviceToken();
    await prisma.userTrustedDevice.create({
      data: {
        user_id: user.user_id,
        device_token: deviceToken,
        last_used_at: new Date(),
      },
    });

    return { deviceToken, message: "OTP verified successfully" };
  },

  async getTrustedDevices(userId) {
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) throw new Error("User not found");

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
