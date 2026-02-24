import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding minimal data (1 role, 1 admin)...");

  const existingRoles = await prisma.role.count();
  if (existingRoles === 0) {
    await prisma.role.create({
      data: {
        name: "Default",
        description: "Default role for exam",
        isActive: true,
      },
    });
    console.log("  - Created role: Default");
  } else {
    console.log("  - Roles already exist, skipping role creation");
  }

  const adminUser = process.env.ADMIN_USER ?? "admin@ssev.co.in";
  const adminPass = process.env.ADMIN_PASS ?? "admin@0321";
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminUser },
  });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPass, 10);
    await prisma.admin.create({
      data: { email: adminUser, passwordHash: hash },
    });
    console.log(`  - Created admin: ${adminUser}`);
  } else {
    console.log(`  - Admin ${adminUser} already exists, skipping`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
