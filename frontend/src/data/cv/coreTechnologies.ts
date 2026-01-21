
import { Server, Globe, BrainCircuit, Cloud, Database, Lock } from "lucide-react";

// export const coreTechnologies = {
//     title: "Core Technologies",
//     categories: [
//         {
//             name: "Backend",
//             icon: Server,
//             color: "bg-blue-500", // Tailwind CSS background color class
//             technologies: ["Java (Spring, Quarkus)", "Node.js (AdonisJs)", "PostgreSQL", "REST APIs", "SQL"]
//         },
//         {
//             name: "Frontend",
//             icon: Globe,
//             color: "bg-green-500",
//             technologies: ["React", "TypeScript", "Vue.js", "Tailwind CSS", "Storybook", "Micro Frontends"]
//         },
//         {
//             name: "AI & ML",
//             icon: BrainCircuit,
//             color: "bg-purple-500",
//             technologies: ["Google Dialogflow", "Conversational AI", "NLP", "Prompt Engineering"]
//         },
//         {
//             name: "Cloud & DevOps",
//             icon: Cloud,
//             color: "bg-orange-500",
//             technologies: ["Google Cloud Platform (GCP)", "Microsoft Azure", "AWS EKS", "Docker", "Kubernetes", "Helm Charts", "CI/CD"]
//         },
//         {
//             name: "Data & Analytics",
//             icon: Database,
//             color: "bg-red-500",
//             technologies: ["Google BigQuery", "Firestore", "Data Studio", "ETL Processes"]
//         },
//         {
//             name: "Security",
//             icon: Lock,
//             color: "bg-gray-500",
//             technologies: ["Keycloak", "Identity & Access Management (IAM)", "JWT"]
//         },
//     ]
// };

export const coreTechnologies = {
    title: "Core Expertise",
    categories: [
        {
            name: "Backend",
            icon: Server,
            color: "bg-blue-500",
            details: {
                "Frameworks & Tools": ["Java (Spring, Quarkus)", "Node.js (AdonisJs)", "REST APIs", "Docker", "Kubernetes"],
                "Languages": ["Java", "SQL", "JavaScript/TypeScript"],
                "Experience": ["Building scalable microservices", "Designing normalized database schemas", "Containerizing applications", "Managing API lifecycles"]
            }
        },
        {
            name: "Frontend",
            icon: Globe,
            color: "bg-green-500",
            details: {
                "Frameworks & Tools": ["React", "Vue.js", "Tailwind CSS", "Storybook", "Vite", "Framer Motion"],
                "Languages": ["TypeScript", "JavaScript", "HTML5", "CSS3"],
                "Experience": ["Developing complex SPAs", "Building reusable component libraries", "Ensuring web accessibility", "Optimizing for performance"]
            }
        },
        {
            name: "AI & ML",
            icon: BrainCircuit,
            color: "bg-purple-500",
            details: {
                "Platforms & Tools": ["Google Dialogflow", "OpenAI API", "LangChain", "Vector Databases"],
                "Concepts": ["Conversational AI Design", "NLP", "Prompt Engineering", "RAG (Retrieval-Augmented Generation)"],
                "Experience": ["Deploying enterprise-grade chatbots", "Automating user support flows", "Integrating LLMs into applications"]
            }
        },
        {
            name: "Cloud & DevOps",
            icon: Cloud,
            color: "bg-orange-500",
            details: {
                "Platforms": ["Google Cloud Platform (GCP)", "Microsoft Azure", "AWS (EKS)", "Vercel"],
                "Tools": ["Helm Charts", "GitHub Actions", "Terraform (Basic)", "Grafana"],
                "Experience": ["Managing CI/CD pipelines", "Deploying to Kubernetes", "Designing serverless architectures", "Certified Cloud Architect"]
            }
        },
        {
            name: "Data & Analytics",
            icon: Database,
            color: "bg-red-500",
            details: {
                "Platforms": ["Google BigQuery", "Firestore", "Data Studio", "ETL Processes"],
                "Tools": ["Google Data Studio", "Firestore", "ETL Processes"],
                "Experience": ["Building data pipelines", "Designing normalized database schemas", "Containerizing applications", "Managing API lifecycles"]
            }
        },
        {
            name: "Security",
            icon: Lock,
            color: "bg-gray-500",
            details: {
                "Platforms": ["Google Cloud Platform (GCP)", "Microsoft Azure", "AWS (EKS)", "Vercel"],
                "Tools": ["Helm Charts", "GitHub Actions", "Terraform (Basic)", "Grafana"],
                "Experience": ["Managing CI/CD pipelines", "Deploying to Kubernetes", "Designing serverless architectures", "Certified Cloud Architect"]
            }
        },
    ]
};