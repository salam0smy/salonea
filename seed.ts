/**
 * Seeds the database with the Nour Beauty Salon demo tenant (local dev only).
 * Run with SEED_DRY_RUN=1 to output SQL to stdout for supabase/seed.sql.
 * Run without to apply directly to the database (after $resetDatabase).
 *
 * Usage:
 *   npx tsx seed.ts              # seed DB directly (resets then seeds)
 *   SEED_DRY_RUN=1 npx tsx seed.ts  # print SQL to stdout for seed.sql
 */
import { createSeedClient } from "@snaplet/seed";

const DEMO_TENANT_ID = "a0000000-0000-0000-0000-000000000001";
const CATEGORY_IDS = {
  hair: "c0000000-0000-0000-0000-000000000001",
  nails: "c0000000-0000-0000-0000-000000000002",
  skin: "c0000000-0000-0000-0000-000000000003",
  makeup: "c0000000-0000-0000-0000-000000000004",
};
const STAFF_IDS = {
  sara: "f0000000-0000-0000-0000-000000000001",
  noura: "f0000000-0000-0000-0000-000000000002",
  reem: "f0000000-0000-0000-0000-000000000003",
};
const SERVICE_IDS = [
  "e0000000-0000-0000-0000-000000000001",
  "e0000000-0000-0000-0000-000000000002",
  "e0000000-0000-0000-0000-000000000003",
  "e0000000-0000-0000-0000-000000000004",
  "e0000000-0000-0000-0000-000000000005",
  "e0000000-0000-0000-0000-000000000006",
  "e0000000-0000-0000-0000-000000000007",
  "e0000000-0000-0000-0000-000000000008",
  "e0000000-0000-0000-0000-000000000009",
  "e0000000-0000-0000-0000-000000000010",
  "e0000000-0000-0000-0000-000000000011",
];

const main = async () => {
  const isDryRun = process.env.SEED_DRY_RUN === "1";
  const seed = await createSeedClient({ dryRun: isDryRun });

  if (!isDryRun) {
    await seed.$resetDatabase();
  }

  // 1. Tenant
  await seed.public_tenants([
    {
      id: DEMO_TENANT_ID,
      slug: "nour-beauty",
      name: "صالون نور للتجميل",
      name_en: "Nour Beauty Salon",
      description:
        "صالون نسائي متخصص في العناية بالشعر والأظافر والبشرة في الرياض",
      logo_url: null,
      brand_color: "#C9A87C",
      phone: "+966501234567",
    },
  ]);

  // 2. Tenant settings
  await seed.tenant_settings([
    {
      tenant_id: DEMO_TENANT_ID,
      payment_mode: "at_salon",
      max_advance_days: 30,
    },
  ]);

  // 3. Service categories
  await seed.service_categories([
    { id: CATEGORY_IDS.hair, tenant_id: DEMO_TENANT_ID, name: "الشعر", name_en: "Hair", sort_order: 1 },
    { id: CATEGORY_IDS.nails, tenant_id: DEMO_TENANT_ID, name: "الأظافر", name_en: "Nails", sort_order: 2 },
    { id: CATEGORY_IDS.skin, tenant_id: DEMO_TENANT_ID, name: "البشرة", name_en: "Skin", sort_order: 3 },
    { id: CATEGORY_IDS.makeup, tenant_id: DEMO_TENANT_ID, name: "المكياج", name_en: "Makeup", sort_order: 4 },
  ]);

  // 4. Services
  await seed.services([
    { id: SERVICE_IDS[0], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.hair, name: "قص وتصفيف الشعر", name_en: "Haircut & Style", description: null, price: 150, duration_minutes: 60, sort_order: 1 },
    { id: SERVICE_IDS[1], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.hair, name: "صبغة شعر كاملة", name_en: "Full Hair Color", description: null, price: 350, duration_minutes: 120, sort_order: 2 },
    { id: SERVICE_IDS[2], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.hair, name: "كيراتين", name_en: "Keratin Treatment", description: null, price: 500, duration_minutes: 180, sort_order: 3 },
    { id: SERVICE_IDS[3], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.hair, name: "بروتين للشعر", name_en: "Protein Treatment", description: null, price: 280, duration_minutes: 90, sort_order: 4 },
    { id: SERVICE_IDS[4], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.nails, name: "مناكير جل", name_en: "Gel Manicure", description: null, price: 120, duration_minutes: 45, sort_order: 1 },
    { id: SERVICE_IDS[5], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.nails, name: "باديكير", name_en: "Pedicure", description: null, price: 100, duration_minutes: 45, sort_order: 2 },
    { id: SERVICE_IDS[6], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.nails, name: "تطويل أظافر", name_en: "Nail Extensions", description: null, price: 200, duration_minutes: 90, sort_order: 3 },
    { id: SERVICE_IDS[7], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.skin, name: "تنظيف بشرة عميق", name_en: "Deep Cleansing Facial", description: null, price: 250, duration_minutes: 60, sort_order: 1 },
    { id: SERVICE_IDS[8], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.skin, name: "إزالة شعر بالشمع", name_en: "Full Waxing", description: null, price: 180, duration_minutes: 60, sort_order: 2 },
    { id: SERVICE_IDS[9], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.makeup, name: "مكياج سهرة", name_en: "Evening Makeup", description: null, price: 300, duration_minutes: 75, sort_order: 1 },
    { id: SERVICE_IDS[10], tenant_id: DEMO_TENANT_ID, category_id: CATEGORY_IDS.makeup, name: "مكياج عرائس", name_en: "Bridal Makeup", description: null, price: 800, duration_minutes: 120, sort_order: 2 },
  ]);

  // 5. Staff
  await seed.staff([
    { id: STAFF_IDS.sara, tenant_id: DEMO_TENANT_ID, name: "سارة العمري", name_en: "Sara Al-Omari", photo_url: null },
    { id: STAFF_IDS.noura, tenant_id: DEMO_TENANT_ID, name: "نورة الزهراني", name_en: "Noura Al-Zahrani", photo_url: null },
    { id: STAFF_IDS.reem, tenant_id: DEMO_TENANT_ID, name: "ريم الشمري", name_en: "Reem Al-Shammari", photo_url: null },
  ]);

  // 6. Staff ↔ Services
  await seed.staff_services([
    { staff_id: STAFF_IDS.sara, service_id: SERVICE_IDS[0] },
    { staff_id: STAFF_IDS.sara, service_id: SERVICE_IDS[1] },
    { staff_id: STAFF_IDS.sara, service_id: SERVICE_IDS[2] },
    { staff_id: STAFF_IDS.sara, service_id: SERVICE_IDS[3] },
    { staff_id: STAFF_IDS.noura, service_id: SERVICE_IDS[4] },
    { staff_id: STAFF_IDS.noura, service_id: SERVICE_IDS[5] },
    { staff_id: STAFF_IDS.noura, service_id: SERVICE_IDS[6] },
    { staff_id: STAFF_IDS.reem, service_id: SERVICE_IDS[7] },
    { staff_id: STAFF_IDS.reem, service_id: SERVICE_IDS[8] },
    { staff_id: STAFF_IDS.reem, service_id: SERVICE_IDS[9] },
    { staff_id: STAFF_IDS.reem, service_id: SERVICE_IDS[10] },
  ]);

  // 7. Working hours (salon default: Sun–Thu 09:00–18:00, Fri–Sat closed)
  await seed.working_hours([
    { tenant_id: DEMO_TENANT_ID, staff_id: null, day_of_week: 0, start_time: "09:00", end_time: "18:00", is_working: true },
    { tenant_id: DEMO_TENANT_ID, staff_id: null, day_of_week: 1, start_time: "09:00", end_time: "18:00", is_working: true },
    { tenant_id: DEMO_TENANT_ID, staff_id: null, day_of_week: 2, start_time: "09:00", end_time: "18:00", is_working: true },
    { tenant_id: DEMO_TENANT_ID, staff_id: null, day_of_week: 3, start_time: "09:00", end_time: "18:00", is_working: true },
    { tenant_id: DEMO_TENANT_ID, staff_id: null, day_of_week: 4, start_time: "09:00", end_time: "18:00", is_working: true },
    { tenant_id: DEMO_TENANT_ID, staff_id: null, day_of_week: 5, start_time: "09:00", end_time: "18:00", is_working: false },
    { tenant_id: DEMO_TENANT_ID, staff_id: null, day_of_week: 6, start_time: "09:00", end_time: "18:00", is_working: false },
  ]);

  if (!isDryRun) {
    console.log("Database seeded successfully!");
  }

  process.exit();
};

main();
