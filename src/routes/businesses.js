const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

// GET /businesses?q=&category=&area= — search/filter businesses
router.get("/", async (req, res) => {
  try {
    const { q, category, area } = req.query;

    const where = {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: String(q), mode: "insensitive" } },
                // Note: `has` on a String[] needs an exact match, not a
                // partial one — good enough for MVP, but searching
                // "amala" won't match a service string like "Amala & gbegiri".
                // A more thorough search (Postgres full-text, or a
                // dedicated search field) is a reasonable later upgrade.
                { services: { has: String(q) } },
              ],
            }
          : {},
        category ? { category: { slug: String(category) } } : {},
        area ? { area: String(area) } : {},
      ],
    };

    const results = await prisma.business.findMany({
      where,
      include: { category: true, photos: true },
      orderBy: { name: "asc" },
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
});

// GET /businesses/:slug — a single business profile by slug
// (matches how the frontend links to /business/[slug])
router.get("/:slug", async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: { slug: req.params.slug },
      include: { category: true, photos: true },
    });
    if (!business) return res.status(404).json({ error: "Business not found" });
    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch business" });
  }
});

/**
 * POST /businesses
 * Phase 5 task: create a listing. Requires auth (owner only) —
 * add your auth middleware here once it exists (Phase 4).
 */
router.post("/", async (req, res) => {
  res.status(501).json({ note: "TODO: Phase 5 — create listing, auth required" });
});

/**
 * PUT /businesses/:id
 * Phase 5 task: update a listing. Owner-only.
 */
router.put("/:id", async (req, res) => {
  res.status(501).json({ note: "TODO: Phase 5 — update listing, owner-only" });
});

module.exports = router;
