/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const badges = [
        { name: "Newbie", icon: "🌱", xpRequired: 0 },
        { name: "Scholar", icon: "📚", xpRequired: 100 },
        { name: "Magic Wizard", icon: "🧙‍♂️", xpRequired: 500 },
        { name: "Daily Hero", icon: "⚡", xpRequired: 1000 },
    ];

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { id: badge.name.toLowerCase().replace(" ", "-") },
            update: {},
            create: {
                id: badge.name.toLowerCase().replace(" ", "-"),
                ...badge,
            },
        });
    }

    console.log("Seed data created successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
