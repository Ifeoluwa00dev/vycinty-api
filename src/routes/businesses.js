const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

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

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// POST /businesses — create a listing (auth required)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, categorySlug, description, hours, phone, whatsapp, area, services } = req.body;
    if (!name || !categorySlug || !description || !hours || !phone || !area) {
      return res.status(400).json({ error: "name, categorySlug, description, hours, phone, and area are required" });
    }

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) return res.status(400).json({ error: "Unknown category" });

    let slug = slugify(name);
    // Avoid slug collisions by appending a short suffix if needed.
    const clash = await prisma.business.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const business = await prisma.business.create({
      data: {
        slug,
        name,
        description,
        hours,
        phone,
        whatsapp: whatsapp || null,
        area,
        services: Array.isArray(services) ? services : [],
        categoryId: category.id,
        ownerId: req.ownerId,
      },
      include: { category: true, photos: true },
    });

    res.status(201).json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create listing" });
  }
});

// PUT /businesses/:id — update a listing (owner-only)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({ where: { id: req.params.id } });
    if (!business) return res.status(404).json({ error: "Business not found" });
    if (business.ownerId !== req.ownerId) {
      return res.status(403).json({ error: "You don't have permission to edit this listing" });
    }

    const { name, description, hours, phone, whatsapp, area, services, categorySlug } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (hours !== undefined) data.hours = hours;
    if (phone !== undefined) data.phone = phone;
    if (whatsapp !== undefined) data.whatsapp = whatsapp;
    if (area !== undefined) data.area = area;
    if (services !== undefined) data.services = services;
    if (categorySlug !== undefined) {
      const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!category) return res.status(400).json({ error: "Unknown category" });
      data.categoryId = category.id;
    }

    const updated = await prisma.business.update({
      where: { id: req.params.id },
      data,
      include: { category: true, photos: true },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update listing" });
  }
});

module.exports = router;