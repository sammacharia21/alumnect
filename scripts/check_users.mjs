import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    select: {
      id: true,
      email: true,
      role: true,
      passwordHash: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          department: true,
          jobTitle: true,
        },
      },
    },
  });

  console.log("Found", users.length, "users:");
  for (const u of users) {
    console.log(`- ${u.role}: ${u.email} | Name: ${u.profile?.fullName || 'No profile'} | Hash: ${u.passwordHash.substring(0, 15)}...`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

