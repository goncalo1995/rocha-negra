export const burgerStackData = {
    title: "My Backend Burger Philosophy",
    description: "Building an early-stage startup requires a tech stack that's flexible, cost-efficient, and quick to set up. Here's my blueprint for a fast, scalable, and manageable backend.",
    layers: [
        { name: "Top Bun", category: "Integrated DevOps", tech: "GitHub Actions", description: "Reduces setup complexity and avoids overengineering infrastructure.", experienceLevel: 90 },
        { name: "Veggies", category: "Flexible Database", tech: "PostgreSQL, Supabase", description: "Start simple and evolve your data model as the application matures.", experienceLevel: 85 },
        { name: "Pickles", category: "Caching", tech: "CDNs (Cloudflare/Vercel)", description: "Zero-cost performance boosts through global and browser caching.", experienceLevel: 80 },
        { name: "Lettuce", category: "Minimal Early Testing", tech: "Jest / Vitest", description: "Focus on catching obvious errors early, adding robustness as the product grows.", experienceLevel: 75, notUsed: true },
        { name: "Cheese", category: "Unified Language", tech: "Next.js / TypeScript", description: "Reduces context switching and accelerates feature development.", experienceLevel: 95 },
        { name: "The Patty", category: "API Layer", tech: "REST & GraphQL", description: "Predictable and maintainable communication for web and mobile clients.", experienceLevel: 95 },
        { name: "The Sauce", category: "CI/CD", tech: "GitHub Actions", description: "Simple, no-setup pipeline integrated directly with the codebase.", experienceLevel: 90 },
        { name: "Bottom Bun", category: "Serverless Architecture", tech: "Vercel / AWS Lambda", description: "Pay only for what you use with automatic scaling and reduced overhead.", experienceLevel: 80 },
    ],
    unusedTech: [
        { name: "Deep E2E Testing", description: "Cypress/Playwright - valuable for mature products, but can slow down early-stage iteration." },
        { name: "Managing Servers", description: "EC2/VPS - Serverless abstracts away this operational burden, allowing focus on product." },
    ]
};