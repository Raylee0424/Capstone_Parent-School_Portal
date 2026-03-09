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
// Two maps are kept in sync so that:
//   • A new request for the same email invalidates the previous token immediately.
//   • Token lookup is O(1) on the hot path (verify).
//
//   passwordResetTokens : token  → { email, expiresAt }
//   passwordResetByEmail: email  → token  (for single-token-per-email enforcement)
const passwordResetTokens = new Map();
const passwordResetByEmail = new Map();
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Remove an existing reset token for the given email (if any).
 * Called before issuing a fresh token so there is at most one live token per user.
 */
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
   * Login flow — trusted device bypass or OTP challenge.
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

    if (deviceToken) {
      const hashedToken = hashDeviceToken(deviceToken);
      const trustedDevice = await prisma.userTrustedDevice.findFirst({
        where: { user_id: user.user_id, device_token: hashedToken },
      });

      if (trustedDevice) {
        await prisma.userTrustedDevice.update({
          where: { td_id: trustedDevice.td_id },
          data: { last_used_at: new Date() },
        });

        const token = signToken(user);
        const { password: _, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
      }
    }

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

  /**
   * POST /auth/forgot-password
   *
   * Generates a secure reset token, stores it in memory with a 1-hour TTL,
   * then emails a signed reset link to the user.
   *
   * Security note: we always return success even if the email is not found.
   * This prevents user-enumeration attacks — attackers should not be able to
   * tell whether an email address is registered.
   */
  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Silently succeed for unknown addresses (anti-enumeration)
    if (!user) return true;

    // Invalidate any live token for this email before issuing a new one
    invalidateResetToken(email);

    // Cryptographically random 32-byte hex token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;

    // Persist in both maps
    passwordResetTokens.set(rawToken, { email, expiresAt });
    passwordResetByEmail.set(email, rawToken);

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;

    const emailSent = await sendPasswordResetEmail(email, resetLink);
    if (!emailSent) {
      // Roll back the stored token — the link was never delivered
      passwordResetTokens.delete(rawToken);
      passwordResetByEmail.delete(email);
      throw new Error("Failed to send password reset email");
    }

    return true;
  },

  /**
   * POST /auth/reset-password
   *
   * Validates the reset token and replaces the user's password.
   * The token is deleted immediately after a successful reset so it
   * cannot be replayed.
   *
   * @param {string} token       — raw token from the reset link query string
   * @param {string} newPassword — plain-text password chosen by the user
   */
  async resetPassword(token, newPassword) {
    const entry = passwordResetTokens.get(token);

    // Token not found or already consumed
    if (!entry) {
      throw new Error("Invalid or expired reset token");
    }

    // Token found but past its TTL
    if (Date.now() > entry.expiresAt) {
      passwordResetTokens.delete(token);
      passwordResetByEmail.delete(entry.email);
      throw new Error("Invalid or expired reset token");
    }

    const user = await prisma.user.findUnique({
      where: { email: entry.email },
    });
    if (!user) {
      // Should not normally happen, but clean up and surface an error
      passwordResetTokens.delete(token);
      passwordResetByEmail.delete(entry.email);
      throw new Error("User not found");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { password: hashedPassword },
    });

    // Consume the token — one-time use only
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
