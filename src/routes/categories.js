const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// GET /categories — list all categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

module.exports = router;
