// Seeds the same sample Ile-Ife businesses the frontend currently uses
// as mock data (src/lib/data.ts in VYCINTY-V2), so once the frontend
// switches to real API calls, the data on screen doesn't change.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  { slug: "food-drink", name: "Food & Drink", tag: "Chop spots, canteens, drinks" },
  { slug: "fashion-tailoring", name: "Fashion & Tailoring", tag: "Adire, aso-oke, tailors" },
  { slug: "beauty-grooming", name: "Beauty & Grooming", tag: "Salons, barbers, spas" },
  { slug: "home-repairs", name: "Home & Repairs", tag: "Electricians, plumbers, artisans" },
  { slug: "electronics-tech", name: "Electronics & Tech", tag: "Phone repair, gadgets, cyber café" },
  { slug: "education", name: "Education & Lessons", tag: "Tutors, lesson centres, workshops" },
  { slug: "events-rentals", name: "Events & Rentals", tag: "Caterers, decor, chairs & canopies" },
  { slug: "health-wellness", name: "Health & Wellness", tag: "Pharmacies, clinics, gyms" },
];

const businesses = [
  { slug: "iya-moria-kitchen", name: "Iya Moria Kitchen", category: "food-drink", area: "Sabo",
    description: "Home-style Yoruba dishes — amala, gbegiri, and efo riro made fresh daily for the campus crowd.",
    hours: "Mon–Sat, 8am–9pm", phone: "0803 000 1122", whatsapp: "0803 000 1122",
    services: ["Amala & gbegiri", "Efo riro", "Take-away packs", "Bulk event orders"] },
  { slug: "adire-craft-studio", name: "Adire Craft Studio", category: "fashion-tailoring", area: "Moore",
    description: "Hand-dyed adire fabric and made-to-measure outfits, blending traditional patterns with modern cuts.",
    hours: "Mon–Sat, 9am–6:30pm", phone: "0805 221 3390", whatsapp: "0805 221 3390",
    services: ["Custom adire dyeing", "Made-to-measure tailoring", "Aso-ebi coordination"] },
  { slug: "campus-cuts-barbing", name: "Campus Cuts Barbing Salon", category: "beauty-grooming", area: "OAU Campus",
    description: "Quick, clean fades and beard grooming a short walk from the main gate.",
    hours: "Daily, 8am–8pm", phone: "0706 442 8871", whatsapp: "0706 442 8871",
    services: ["Fades & tapers", "Beard grooming", "Kids' cuts"] },
  { slug: "bright-spark-electricals", name: "Bright Spark Electricals", category: "home-repairs", area: "Ilode",
    description: "Wiring, installations, and same-day repairs for homes and shops across Ile-Ife.",
    hours: "Mon–Sat, 7am–7pm", phone: "0812 556 0043", whatsapp: "0812 556 0043",
    services: ["Wiring & rewiring", "Fault diagnosis", "Generator & inverter setup"] },
  { slug: "moore-mobile-repairs", name: "Moore Mobile Repairs", category: "electronics-tech", area: "Moore",
    description: "Screen replacements, battery swaps, and unlocking for all major phone brands.",
    hours: "Mon–Sat, 9am–7pm", phone: "0701 990 4432", whatsapp: "0701 990 4432",
    services: ["Screen repair", "Battery replacement", "Software unlocking"] },
  { slug: "lagere-lesson-centre", name: "Lagere Lesson Centre", category: "education", area: "Lagere",
    description: "After-school and weekend lessons for secondary school students, JAMB and WAEC-focused.",
    hours: "Mon–Fri 3–6pm, Sat 10am–2pm", phone: "0817 233 9081", whatsapp: "0817 233 9081",
    services: ["JAMB prep", "WAEC tutorials", "Small group classes"] },
  { slug: "enuwa-events-decor", name: "Enuwa Events & Décor", category: "events-rentals", area: "Enuwa",
    description: "Chairs, canopies, and full event styling for weddings, birthdays, and traditional ceremonies.",
    hours: "By appointment", phone: "0909 114 7765", whatsapp: "0909 114 7765",
    services: ["Canopy & chair rentals", "Event styling", "Traditional wedding setup"] },
  { slug: "mayfair-family-pharmacy", name: "Mayfair Family Pharmacy", category: "health-wellness", area: "Mayfair",
    description: "Community pharmacy stocking everyday medication with a resident pharmacist on-site.",
    hours: "Daily, 8am–10pm", phone: "0803 771 2290", whatsapp: "0803 771 2290",
    services: ["Prescription filling", "Blood pressure checks", "First-aid supplies"] },
  { slug: "modakeke-chop-house", name: "Modakeke Chop House", category: "food-drink", area: "Modakeke",
    description: "Local favourite for pounded yam and native soups, busiest during lunch hour.",
    hours: "Mon–Sun, 10am–9pm", phone: "0708 664 1123", whatsapp: "0708 664 1123",
    services: ["Pounded yam & egusi", "Native soups", "Weekend specials"] },
];

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  for (const b of businesses) {
    const category = await prisma.category.findUnique({ where: { slug: b.category } });
    await prisma.business.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        slug: b.slug,
        name: b.name,
        description: b.description,
        hours: b.hours,
        phone: b.phone,
        whatsapp: b.whatsapp,
        area: b.area,
        services: b.services,
        categoryId: category.id,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${businesses.length} businesses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
