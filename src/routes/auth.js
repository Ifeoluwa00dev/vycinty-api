const express = require("express");

const router = express.Router();

/**
 * POST /auth/signup
 * Phase 4 task: create an owner account. Hash the password
 * (bcryptjs is already in package.json) before storing it, and
 * issue a JWT (jsonwebtoken is already installed) on success.
 */
router.post("/signup", async (req, res) => {
  res.status(501).json({ note: "TODO: Phase 4 — hash password, create owner, issue JWT" });
});

router.post("/login", async (req, res) => {
  res.status(501).json({ note: "TODO: Phase 4 — verify credentials, issue JWT" });
});

module.exports = router;
