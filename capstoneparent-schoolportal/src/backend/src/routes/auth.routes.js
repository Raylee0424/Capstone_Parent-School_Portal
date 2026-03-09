const express = require("express");
const { body, param } = require("express-validator");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validation");
const { authenticate } = require("../middlewares/auth");
const multer = require("multer");

const upload = multer({ dest: process.env.UPLOAD_PATH || "uploads/" });
const router = express.Router();

// ─── Registration (2-step: initiate → verify) ──────────────────────────────

// Step 1: Validate data, store pending, send OTP — no DB write yet
router.post(
  "/register",
  upload.array("attachments", 10),
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("fname").notEmpty().trim(),
    body("lname").notEmpty().trim(),
    body("contact_num").notEmpty(),
    body("address").notEmpty(),
    body("role")
      .optional()
      .isIn([
        "Parent",
        "Librarian",
        "Teacher",
        "Admin",
        "Principal",
        "Vice_Principal",
      ]),
    body("student_ids").optional().isArray({ min: 1 }),
    body("student_ids.*").optional().isInt(),
  ],
  validate,
  authController.register,
);

// Step 2: Verify OTP → create account as Inactive
router.post(
  "/verify-registration-otp",
  [
    body("email").isEmail().normalizeEmail(),
    body("otpCode").isLength({ min: 6, max: 6 }),
  ],
  validate,
  authController.verifyRegistrationOTP,
);

// ─── Login ──────────────────────────────────────────────────────────────────

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    body("deviceToken").optional().isString().isLength({ min: 10 }),
  ],
  validate,
  authController.login,
);

// ─── OTP (post-login MFA) ────────────────────────────────────────────────────

router.post(
  "/send-otp",
  [body("email").isEmail().normalizeEmail()],
  validate,
  authController.sendOTP,
);

router.post(
  "/verify-otp",
  [
    body("email").isEmail().normalizeEmail(),
    body("otpCode").isLength({ min: 6, max: 6 }),
  ],
  validate,
  authController.verifyOTP,
);

// ─── Password Reset (public — no auth required) ──────────────────────────────

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Sends a password reset link to the given email if an account exists.
 * Always returns 200 to prevent email enumeration.
 */
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("A valid email address is required")
      .normalizeEmail(),
  ],
  validate,
  authController.forgotPassword,
);

/**
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 *
 * Validates the reset token (from the emailed link) and updates the password.
 * The token is single-use and expires after 1 hour.
 */
router.post(
  "/reset-password",
  [
    body("token")
      .notEmpty()
      .withMessage("Reset token is required")
      .isHexadecimal()
      .withMessage("Invalid reset token format")
      .isLength({ min: 64, max: 64 })
      .withMessage("Invalid reset token length"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
  ],
  validate,
  authController.resetPassword,
);

// ─── Authenticated routes ────────────────────────────────────────────────────

router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);
router.get("/trusted-devices", authenticate, authController.getTrustedDevices);
router.delete(
  "/trusted-devices/:id",
  authenticate,
  param("id").isInt(),
  validate,
  authController.removeTrustedDevice,
);

module.exports = router;
