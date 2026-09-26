const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();

function issueToken(owner) {
  return jwt.sign({ ownerId: owner.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /auth/signup — create an owner account
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existing = await prisma.owner.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const owner = await prisma.owner.create({
      data: { name, email, passwordHash },
    });

    const token = issueToken(owner);
    res.status(201).json({
      token,
      owner: { id: owner.id, name: owner.name, email: owner.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// POST /auth/login — verify credentials, issue a token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const owner = await prisma.owner.findUnique({ where: { email } });
    if (!owner) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, owner.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = issueToken(owner);
    res.json({
      token,
      owner: { id: owner.id, name: owner.name, email: owner.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

module.exports = router;