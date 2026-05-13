import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/crypto.js";
import { DEFAULT_LABELS } from "../config/constants.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    create: {
      username: "admin",
      email: "admin@veteran.dev",
      passwordHash: adminPassword,
      displayName: "Admin User",
      isAdmin: true,
      isEmailVerified: true,
    },
    update: {},
  });
  console.log("Created admin user:", admin.username);

  const demoPassword = await hashPassword("demo123");
  const demoUser = await prisma.user.upsert({
    where: { username: "demo" },
    create: {
      username: "demo",
      email: "demo@veteran.dev",
      passwordHash: demoPassword,
      displayName: "Demo User",
      isEmailVerified: true,
    },
    update: {},
  });
  console.log("Created demo user:", demoUser.username);

  const demoRepo = await prisma.repository.upsert({
    where: { fullName: "demo/hello-world" },
    create: {
      ownerId: demoUser.id,
      name: "hello-world",
      fullName: "demo/hello-world",
      description: "A demo repository for VETERAN",
      isPrivate: false,
      defaultBranch: "main",
    },
    update: {},
  });
  console.log("Created demo repo:", demoRepo.fullName);

  for (const labelData of DEFAULT_LABELS) {
    await prisma.issueLabel.upsert({
      where: { repositoryId_name: { repositoryId: demoRepo.id, name: labelData.name } },
      create: {
        repositoryId: demoRepo.id,
        name: labelData.name,
        color: labelData.color,
        description: labelData.description,
      },
      update: {},
    });
  }
  console.log("Created default labels");

  const org = await prisma.organization.upsert({
    where: { slug: "veteran-org" },
    create: {
      name: "VETERAN Org",
      slug: "veteran-org",
      description: "The VETERAN organization",
    },
    update: {},
  });

  await prisma.orgMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: admin.id } },
    create: {
      organizationId: org.id,
      userId: admin.id,
      role: "owner",
    },
    update: {},
  });
  console.log("Created organization:", org.name);

  const demoIssue = await prisma.issue.upsert({
    where: { repositoryId_number: { repositoryId: demoRepo.id, number: 1 } },
    create: {
      repositoryId: demoRepo.id,
      number: 1,
      title: "Welcome to VETERAN!",
      body: "This is your first issue. Feel free to explore the platform.",
      authorId: demoUser.id,
      labelsList: ["good first issue"],
    },
    update: {},
  });
  console.log("Created demo issue #1");

  await prisma.issueComment.upsert({
    where: { id: `comment-${demoIssue.id}-1` },
    create: {
      id: `comment-${demoIssue.id}-1`,
      issueId: demoIssue.id,
      authorId: admin.id,
      body: "Welcome! Let us know if you have any questions.",
    },
    update: {},
  });

  await prisma.adminSetting.upsert({
    where: { key: "site_name" },
    create: { key: "site_name", value: "VETERAN" },
    update: {},
  });

  await prisma.adminSetting.upsert({
    where: { key: "allow_registration" },
    create: { key: "allow_registration", value: true },
    update: {},
  });

  console.log("Created admin settings");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
