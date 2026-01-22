// --- YOUR PERSONAL CV CONTENT ---
// This is the only file you'll need to edit in the future to update your CV.

export const cvData = {
    personalInfo: {
        name: "Gonçalo Lascasas Cereja Ribeiro Pereira",
        role: "Fullstack Engineer & AI Enthusiast",
        imageUrl: "https://files.rochanegra.com/cv/image-cv.jpeg", // Place your image in the `public` folder
        profile: `I am deeply passionate about developing technological solutions that streamline everyday tasks and enhance efficiency. With a strong focus on problem-solving, I aim to create systems that simplify complex processes and improve user experiences. I have a particular interest in chatbots and automation, and by combining my technical expertise with a keen understanding of user needs, I strive to build intuitive, scalable solutions that drive both productivity and ease of use.`,
        contacts: [
            { type: 'email', value: 'cerejagoncalo@gmail.com', href: 'mailto:cerejagoncalo@gmail.com' },
            // { type: 'phone', value: '+351 91', href: 'tel:+351' },
            { type: 'linkedin', value: 'linkedin.com/in/gonçalo-pereira', href: 'https://linkedin.com/in/gonçalo-pereira' },
            { type: 'github', value: 'github.com/goncalo1995', href: 'https://github.com/goncalo1995' },
        ]
    },
    sections: [
        {
            title: "Work Experience",
            type: 'experience',
            items: [
                {
                    role: "Self-Employed",
                    company: "Personal Projects",
                    period: "2025 - Present",
                    description: `Currently, I am focused on developing mobile applications using React Native, enabling the creation of cross-platform apps. Additionally, I am gaining expertise in building Software-as-a-Service (SaaS) systems, providing online tools that users can access from anywhere. I am also actively exploring the rapidly advancing field of Artificial Intelligence, including prompt engineering to optimize AI interactions, and learning how to implement and manage AI tools for personal use. I am passionate about staying current with emerging technologies and continuously enhancing my capabilities.`,
                    technologies: ["React Native", "SaaS Architecture", "AI", "Prompt Engineering"]
                },
                {
                    role: "Fullstack Engineer",
                    company: "Feedzai",
                    period: "2024 - 2025",
                    description: `Developed and maintained features for large-scale backend systems, improving data processing efficiency in a leading fraud detection company, working within a high-security environment. Built modern user interfaces for financial crime monitoring tools using micro frontends. Managed application deployments and configurations using Docker containers and Helm charts in a Kubernetes environment. Provided technical support and mentorship to colleagues on Identity and Access Management (IAM) systems.`,
                    technologies: ["React", "Java", "Quarkus", "Docker", "Kubernetes", "Grafana"]
                },
                {
                    role: "Consultant",
                    company: "Link Consulting",
                    period: "2019 - 2024",
                    description: `Engineered an automated workflow solution on Azure, creating a seamless data pipeline between Dynamics, Sharepoint, Teams, and Edoclink to enhance process efficiency and ensure data consistency. Engineered and deployed conversational AI solutions for public sector clients using Dialogflow and Google Cloud. Designed complex conversational flows and backend fulfilment logic to automate user support and enhance service accessibility 24/7. Developed the full-stack 'Talk to Us' web app for CTT, using AdonisJs (Node.js) for the backend API and React for the interactive frontend. As a full-stack developer on Hyundai's 'Click to Buy' platform, built features using Quarkus for the backend and Vue for the frontend.`,
                    technologies: ["Azure", "Dialogflow", "Google Cloud", "AdonisJs", "Node.js", "React", "Quarkus", "Vue"]
                },
            ]
        },
        {
            title: "Education",
            type: 'education',
            items: [
                {
                    degree: "Master in Information Systems and Computer Engineering",
                    institution: "Instituto Superior Técnico",
                    period: "2016 - 2019",
                    grade: "15.42 / 20",
                    details: ["Erasmus in Czech Technical University, Prague"],
                    thesis: {
                        title: "A Conversational Agent for Academic Services (18 / 20)",
                        description: "Developed and evaluated a chatbot to automate responses to frequently asked questions within a university's academic services department, improving response times and user satisfaction.",
                        fileUrl: "https://fenix.tecnico.ulisboa.pt/downloadFile/1689244997260269/78669-Goncalo-Pereira_dissertacao.pdf", // Place the PDF in your `public` folder,
                        extendedAbstract: "https://fenix.tecnico.ulisboa.pt/downloadFile/1689244997260194/78669-Goncalo-Pereira_resumo.pdf"
                    }
                },
                {
                    degree: "Bachelor in Information Systems and Computer Engineering",
                    institution: "Instituto Superior Técnico",
                    period: "2013 - 2016",
                    grade: "15.29 / 20"
                }
            ]
        },
        {
            title: "Achievements",
            type: 'achievements',
            items: [
                { name: "Google Certified Professional Cloud Developer", date: "July 2024" },
                { name: "Google Certified Professional Cloud Architect", date: "Oct 2021" },
            ]
        },
        {
            title: "Skills",
            type: 'skills',
            items: ["Teamwork", "Problem Solving", "Time Management", "Critical Thinking", "Project Planning"]
        },
        {
            title: "Languages",
            type: 'languages',
            items: [
                { name: "Portuguese", level: "Native" },
                { name: "English", level: "Fluent" },
                { name: "Spanish", level: "Basic" },
            ]
        }
    ]
};

export const experienceData = [
    {
        type: 'role', // A full-time role
        title: "Fullstack Engineer",
        company: "Feedzai",
        period: "2024 - 2025",
        location: "Lisbon, Portugal",
        summary: "Developed features for large-scale fraud detection systems, built UIs using micro frontends, and managed deployments in a high-security Kubernetes environment.",
        star: {
            situation: "Feedzai, a leader in fraud detection, required continuous development of its complex, high-security financial crime monitoring platform.",
            task: "As a Fullstack Engineer, my role was to develop and maintain features across the stack, from backend data processing to frontend user interfaces, while adhering to strict security and performance standards.",
            action: [ // Use an array for multiple points
                "Engineered and maintained backend services in Java (Quarkus), focusing on improving data processing efficiency and scalability.",
                "Built modern, responsive user interfaces for monitoring tools using React and a micro frontend architecture.",
                "Managed the full deployment lifecycle, containerizing applications with Docker and orchestrating them with Helm charts in a Kubernetes (EKS) environment.",
                "Provided technical mentorship and support for the company's Identity and Access Management (IAM) system, built on Keycloak."
            ],
            result: "Contributed to a more efficient and secure platform, improved the user experience for financial crime analysts, and strengthened the team's DevOps and security practices."
        },
        technologies: ["React", "Java", "Quarkus", "Docker", "Kubernetes", "Helm", "Keycloak"]
    },
    {
        type: 'role', // A long-term consulting role
        title: "Consultant",
        company: "Link Consulting",
        period: "2019 - 2024",
        location: "Lisbon, Portugal",
        summary: "Architected and developed sophisticated, client-facing AI and full-stack solutions for major clients in finance, public sector, automotive, and logistics.",
        // No 'star' here, because the details are in the individual project cards below
        technologies: ["GCP", "Azure", "Dialogflow", "AdonisJs", "React", "Vue.js", "Quarkus", "Java", "Node.js"]
    },
    {
        type: 'project', // A specific project from the consulting role
        title: "AI Digital Assistant for Banking",
        company: "Caixa Geral de Depósitos (CGD)",
        period: "2021",
        summary: "Architected and delivered a secure, cloud-native conversational AI solution on GCP to serve internal bank agents and call center operators.",
        star: {
            situation: "The bank's internal support teams were overwhelmed with repetitive queries about credit card products, leading to long wait times and inefficiency.",
            task: "Design and implement a scalable chatbot that could provide instant, accurate answers and integrate with internal systems, while empowering business users to manage the content.",
            action: [
                "Architected the solution on Google Cloud Platform using Dialogflow for the core conversational logic and Firestore for a dynamic knowledge base.",
                "Developed an ETL process to sync information from internal bank systems, ensuring the chatbot's data was always up-to-date.",
                "Created custom monitoring dashboards in Google Data Studio and BigQuery to provide business stakeholders with actionable insights on user interactions and chatbot performance."
            ],
            result: "Dramatically reduced the query load on human agents, provided instant 24/7 support, and gave the business team direct control over the chatbot's responses, leading to greater agility."
        },
        technologies: ["Google Dialogflow", "GCP", "BigQuery", "Data Studio", "ETL"]
    },
    {
        type: 'project', // Another project
        title: "Conversational AI for Public Sector",
        company: "DGAE & DGC",
        period: "2020",
        summary: "Implemented chatbots for government agencies to clarify citizen doubts regarding consumer rights and economic activities.",
        star: {
            situation: "The government agencies were overwhelmed with repetitive queries about consumer rights and economic activities, leading to long wait times and inefficiency.",
            task: "Design and implement a scalable chatbot that could provide instant, accurate answers and integrate with internal systems, while empowering business users to manage the content.",
            action: [
                "Architected the solution on Google Cloud Platform using Dialogflow for the core conversational logic and Firestore for a dynamic knowledge base.",
                "Developed an ETL process to sync information from internal bank systems, ensuring the chatbot's data was always up-to-date.",
                "Created custom monitoring dashboards in Google Data Studio and BigQuery to provide business stakeholders with actionable insights on user interactions and chatbot performance."
            ],
            result: "Dramatically reduced the query load on human agents, provided instant 24/7 support, and gave the business team direct control over the chatbot's responses, leading to greater agility."
        },
        technologies: ["Chatbots", "Backoffice", "NLP"]
    },
    // ... Add cards for CTT, Hyundai, Carplus, Abu Dhabi, INESC, Self-Employed ...
    {
        type: 'education_highlight', // A special type for education
        title: "Erasmus Exchange Program",
        company: "Czech Technical University in Prague",
        period: "Sep 2016 - Feb 2017",
        summary: "Participated in an international exchange program, focusing on advanced Computer Science topics and achieving a high academic standing.",
        star: {
            situation: "As part of my Master's degree, I sought to gain international experience and exposure to different academic approaches in computer science.",
            task: "To successfully complete a semester abroad, adapt to a new cultural and academic environment, and excel in advanced coursework.",
            action: ["Enrolled in courses covering topics such as advanced algorithms, distributed systems, and artificial intelligence.", "Collaborated with an international cohort of students on challenging projects, enhancing my teamwork and cross-cultural communication skills."],
            result: "Achieved an excellent final grade of 18/20, broadened my technical knowledge, and developed valuable soft skills in adaptability and global collaboration."
        },
        technologies: ["Computer Science", "Algorithms", "Distributed Systems"]
    }
];


// Delete the old 'simpleExperience' and 'detailedProjects' arrays.
// This is now your single source of truth for work experience.

export const workExperience = [
    {
        role: "Fullstack Engineer",
        company: "Feedzai",
        period: "2024 - 2025",
        location: "Lisbon, Portugal",
        // The short, impactful summary for the main view
        summary: "Developed features for large-scale fraud detection systems, built UIs using micro frontends, and managed deployments in a high-security Kubernetes environment.",
        // Detailed breakdown of responsibilities for the expanded view
        details: [
            {
                title: "Backend Development (50%)",
                description: "Engineered and maintained backend services in Java (Quarkus), focusing on improving data processing efficiency and scalability in a high-security environment.",
                technologies: ["Java", "Quarkus", "Microservices"]
            },
            {
                title: "Frontend Development (30%)",
                description: "Built modern, responsive user interfaces for financial crime monitoring tools using a micro frontend architecture.",
                technologies: ["React", "TypeScript", "Micro Frontends"]
            },
            {
                title: "DevOps & Deployment (20%)",
                description: "Managed the full deployment lifecycle, containerizing applications with Docker and orchestrating them with Helm charts in Kubernetes (AWS EKS), and implementing monitoring with Grafana.",
                technologies: ["Docker", "Kubernetes", "Helm", "Grafana", "AWS EKS", "Keycloak"]
            }
        ],
        // A comprehensive list for the "Key Technologies" footer
        technologies: ["React", "Java", "Quarkus", "Docker", "Kubernetes", "Helm", "Grafana", "Keycloak"]
    },
    {
        role: "Consultant",
        company: "Link Consulting",
        period: "2019 - 2024 (5 years)",
        location: "Lisbon, Portugal",
        summary: "Architected and developed sophisticated, client-facing AI and full-stack solutions for major clients in finance, public sector, automotive, and logistics.",
        // For this role, the details are a list of key projects
        details: [
            {
                title: "Project: AI Digital Assistant for Banking (CGD)",
                description: "Architected and delivered a secure, cloud-native conversational AI solution on GCP using Dialogflow. Key features included a dynamic knowledge base managed by business users and custom analytics dashboards in Google Data Studio.",
                technologies: ["Google Dialogflow", "GCP", "BigQuery", "Data Studio", "ETL"]
            },
            {
                title: "Project: E-Commerce Platform for Automotive (Hyundai/Carplus)",
                description: "Led development on the 'Click to Buy' platform, establishing a white-label frontend (Vue.js) and a generic backend (Java/Quarkus) on AWS EKS to rapidly onboard new automotive brands.",
                technologies: ["Vue.js", "Quarkus", "Java", "AWS EKS", "Storybook"]
            },
            {
                title: "Project: 'Fale Connosco' AI Portal (CTT)",
                description: "Performed full-stack development of a customer support portal, engineering a scalable backend API with AdonisJs (Node.js) and a modern frontend with React.",
                technologies: ["React", "AdonisJs", "Node.js", "AWS"]
            },
        ],
        technologies: ["Azure", "Dialogflow", "GCP", "AdonisJs", "React", "Vue.js", "Quarkus"]
    },
    // ... Add your other roles (Self-Employed, Erasmus) in this same format.
];

export const workExperienceOld = [
    {
        role: "Fullstack Engineer",
        company: "Feedzai",
        period: "2024 - 2025",
        location: "Lisbon, Portugal",
        // Short summary for the accordion trigger
        summary: "Developed features for large-scale fraud detection systems, built UIs using micro frontends, and managed deployments in a high-security Kubernetes environment.",
        // Detailed breakdown of responsibilities for the expanded view
        responsibilities: [
            {
                title: "Backend Development (50%)",
                description: "Developed and maintained features for large-scale backend systems, improving data processing efficiency and working within a high-security environment.",
                technologies: ["Java", "Quarkus"]
            },
            {
                title: "Frontend Development (30%)",
                description: "Built modern user interfaces for financial crime monitoring tools using a micro frontend architecture.",
                technologies: ["React", "TypeScript"]
            },
            {
                title: "DevOps & Deployment (15%)",
                description: "Managed application deployments and configurations using Docker containers and Helm charts in a Kubernetes environment.",
                technologies: ["Docker", "Kubernetes", "Helm", "Grafana"]
            },
            {
                title: "Mentorship & Support (5%)",
                description: "Provided technical support and mentorship on Identity and Access Management (IAM) systems.",
                technologies: ["Keycloak", "IAM"]
            },
        ],
        // Comprehensive list of all technologies for the footer badges
        technologies: ["React", "Java", "Quarkus", "Docker", "Kubernetes", "Helm", "Grafana", "Keycloak"]
    },
    {
        role: "Consultant",
        company: "Link Consulting",
        period: "2019 - 2024 (5 years)",
        location: "Lisbon, Portugal",
        summary: "Specialized in architecting and developing sophisticated, client-facing AI and full-stack solutions for major clients in finance, public sector, and automotive industries.",
        // Here we use the 'content' array for a more narrative, project-based structure
        content: [
            {
                type: 'intro',
                text: "My role began by initiating and engineering a process automation solution for the internal commercial team using Azure. From there, I transitioned to architecting and developing a wide range of sophisticated, client-facing AI and full-stack solutions."
            },
            {
                type: 'project_highlight',
                title: "AI-Powered Call Center Analytics",
                description: "Delivered an innovative AI platform to enhance call center operations by processing call transcriptions and automatically evaluating operator performance. I developed the comprehensive dashboard UI that provided managers with clear, data-driven insights.",
                technologies: ["AI/ML", "React", "Data Visualization"]
            },
            {
                type: 'project_highlight',
                title: "Conversational AI Architecture (Multi-Cloud)",
                description: "Architected and delivered secure, scalable conversational AI solutions for clients including a major financial institution (CGD on GCP), public sector agencies (DGAE, DGC), and Abu Dhabi Customs (Oracle Digital Assistant).",
                technologies: ["Google Dialogflow", "GCP", "Oracle Digital Assistant", "Chatbots"]
            },
            {
                type: 'project_highlight',
                title: "Full-Stack E-Commerce & Web App Development",
                description: "Led the full-stack development of the 'Fale Connosco' customer portal for CTT (AdonisJs/React) and contributed significantly to Hyundai's 'Click to Buy' e-commerce platform (Quarkus/Vue).",
                technologies: ["AdonisJs", "Node.js", "React", "Quarkus", "Vue.js"]
            }
        ],
        technologies: ["Azure", "Dialogflow", "GCP", "AdonisJs", "Node.js", "React", "Vue.js", "Quarkus", "Angular"]
    },
    // ... add your Self-Employed and other experiences in this same format
];

// This allows for a richer representation than the simple work experience list.
export const detailedProjects = [
    {
        client: "GISLA – Grupo Salvador Caetano",
        company: "Link Consulting",
        period: "05/2022 - Present",
        title: "Process Management Portal",
        summary: "Created a comprehensive process management portal featuring dynamic JSON-based forms, enabling rapid development and deployment of complex business workflows.",
        // --- NEW STAR METHOD FIELDS ---
        star: {
            situation: "The client needed to manage dozens of complex, multi-step business processes, but building a custom UI for each one was slow and expensive.",
            task: "My task was to design and build a generic, reusable system that could render complex forms and their associated logic (validation, dependent fields) from a simple JSON configuration.",
            action: "I led the development of a full-stack solution, creating standalone Vue.js components that parsed the JSON schema to build the UI, and a Java backend to handle the data persistence and workflow logic.",
            result: "We were able to deploy new business processes in days instead of months. The system now powers dozens of critical workflows, significantly reducing development costs and increasing the client's operational agility."
        },
        role: "Full-stack Developer",
        technologies: ["Vue.js", "Java"],
        tags: ['Automotive', 'Enterprise', 'Backend', 'Frontend']
    },
    {
        client: "Digital Store - Carplus Portugal",
        company: "Link Consulting",
        period: "01/2022 – 04/2022",
        title: "E-commerce Platform for Used Cars",
        summary: "Developed a white-label e-commerce 'Digital Store' to replace the old carplus.pt, focusing on lead generation and online sales of used vehicles.",
        description: `The website was designed around key user experiences: Vehicle Reservation/Sale, Trade-in Valuation, Information Requests, Test Drives, Price Drop Alerts, and Car Alerts. This project leveraged a 'White Label' UI component library and a generic common backend, allowing for rapid instantiation of new brands.`,
        role: "Full-stack Developer",
        technologies: ["Vue.js", "Storybook", "Framework7", "Quarkus (Java)", "AWS EKS"],
        tags: ['Automotive', 'E-commerce', 'Backend', 'Frontend', 'Cloud']
    },
    {
        client: "Digital Store – Hyundai Portugal",
        company: "Link Consulting",
        period: "10/2021 – 12/2021",
        title: "Click to Buy E-commerce Platform",
        summary: "Pioneered the 'Digital Store' platform for Hyundai, creating a 'White Label' frontend and generic backend to facilitate rapid expansion to other brands.",
        // --- NEW STAR METHOD FIELDS ---
        star: {
            situation: "The client needed to create an e-commerce platform for Hyundai, but building a custom UI for each brand was slow and expensive.",
            task: "My task was to design and build a generic, reusable system that could render complex forms and their associated logic (validation, dependent fields) from a simple JSON configuration.",
            action: "I led the development of a full-stack solution, creating standalone Vue.js components that parsed the JSON schema to build the UI, and a Java backend to handle the data persistence and workflow logic.",
            result: "We were able to deploy new business processes in days instead of months. The system now powers dozens of critical workflows, significantly reducing development costs and increasing the client's operational agility."
        },
        description: `Creation of the 'Click to Buy' online store to generate leads and enable online sales of new stock cars. This was the foundational project for the Digital Store concept, establishing a reusable UI component library and a common backend architecture designed to quickly and robustly accommodate more brands from the Salvador Caetano Group.`,
        role: "Full-stack Developer",
        technologies: ["Vue.js", "Storybook", "Framework7", "Quarkus (Java)", "AWS EKS"],
        tags: ['Automotive', 'E-commerce', 'Backend', 'Frontend', 'Cloud']
    },
    {
        client: "CTT (Portuguese Postal Service)",
        company: "Link Consulting",
        period: "11/2020 – 09/2021",
        title: "'Fale Connosco' - AI Support Platform",
        summary: "Built the 'Talk to Us' full-stack web app, an AI-powered platform to answer user queries, leveraging an ML model for response classification.",
        // --- NEW STAR METHOD FIELDS ---
        star: {
            situation: "The client needed to create an e-commerce platform for Hyundai, but building a custom UI for each brand was slow and expensive.",
            task: "My task was to design and build a generic, reusable system that could render complex forms and their associated logic (validation, dependent fields) from a simple JSON configuration.",
            action: "I led the development of a full-stack solution, creating standalone Vue.js components that parsed the JSON schema to build the UI, and a Java backend to handle the data persistence and workflow logic.",
            result: "We were able to deploy new business processes in days instead of months. The system now powers dozens of critical workflows, significantly reducing development costs and increasing the client's operational agility."
        },
        description: `This platform was built on AWS, integrating a machine learning model from NeuralShift to classify and provide the best answers to CTT user questions. I developed the backend API using Adonis.js (Node.js) and the interactive frontend with Vue.js.`,
        role: "Full-stack Developer",
        technologies: ["Vue.js", "Adonis.js", "Node.js", "AWS", "Machine Learning"],
        tags: ['Public Sector', 'AI/ML', 'Backend', 'Frontend']
    },
    {
        client: "Caixa Geral de Depósitos (CGD)",
        period: "03/2021 – 07/2021",
        title: "Cloud-Native AI Digital Assistant",
        // --- NEW STAR METHOD FIELDS ---
        star: {
            situation: "The client needed to create an e-commerce platform for Hyundai, but building a custom UI for each brand was slow and expensive.",
            task: "My task was to design and build a generic, reusable system that could render complex forms and their associated logic (validation, dependent fields) from a simple JSON configuration.",
            action: "I led the development of a full-stack solution, creating standalone Vue.js components that parsed the JSON schema to build the UI, and a Java backend to handle the data persistence and workflow logic.",
            result: "We were able to deploy new business processes in days instead of months. The system now powers dozens of critical workflows, significantly reducing development costs and increasing the client's operational agility."
        },
        description2: `Implemented a solution for a digital assistant based on Machine Learning and AI technologies, using Google Dialogflow and Google Cloud Platform...`,
        description: `The solution used Google Dialogflow and Google Cloud Platform, integrating with internal bank systems for dynamic information retrieval. It included an ETL process for updating the chatbot's knowledge base, allowing business users to manage intents and responses. I also created custom monitoring dashboards using Google Data Studio and BigQuery.`,
        role: "Developer & Technical Support",
        company: "Link Consulting",
        summary: "Implemented a cloud-native AI digital assistant on Google Cloud Platform to serve internal bank agents, including custom monitoring dashboards.",
        technologies: ["Google Dialogflow", "GCP", "ETL", "BigQuery", "Data Studio", "Firestore"], // <-- Added missing tech
        tags: ['Finance', 'AI/ML', 'Chatbot', 'Cloud'],
        // ... add a 'star' object
    },
    {
        client: "Feedzai",
        role: "Fullstack Engineer",
        company: "Feedzai",
        period: "2024 - 2025",
        summary: "Developed features for large-scale fraud detection systems, built modern UIs using micro frontends, and managed deployments in a high-security Kubernetes environment.", // <-- Short summary
        description: `Developed and maintained features for large-scale backend systems, improving data processing efficiency in a leading fraud detection company...`, // <-- Full description for modal
        star: {
            situation: "The client needed to create an e-commerce platform for Hyundai, but building a custom UI for each brand was slow and expensive.",
            task: "My task was to design and build a generic, reusable system that could render complex forms and their associated logic (validation, dependent fields) from a simple JSON configuration.",
            action: "I led the development of a full-stack solution, creating standalone Vue.js components that parsed the JSON schema to build the UI, and a Java backend to handle the data persistence and workflow logic.",
            result: "We were able to deploy new business processes in days instead of months. The system now powers dozens of critical workflows, significantly reducing development costs and increasing the client's operational agility."
        },
        technologies: ["React", "Java", "Quarkus", "Docker", "Kubernetes", "Helm", "Grafana", "Keycloak"], // <-- Added missing tech
        tags: ['Finance', 'Security', 'Backend', 'Frontend', 'Cloud'],
    },
];

// We need to keep the simple 'experience' section for the timeline view
export const simpleExperience = [
    // {
    //     role: "Self-Employed",
    //     company: "Personal Projects",
    //     period: "2025 - Present",
    //     // This summary will be shown on the main page
    //     summary: "Developing cross-platform mobile apps with React Native, building SaaS systems, and exploring AI/prompt engineering for personal productivity and automation tools."
    // },
    {
        role: "Fullstack Engineer",
        company: "Feedzai",
        period: "2024 - 2025",
        summary: "Developed features for large-scale fraud detection systems, built UIs using micro frontends, and managed deployments in a high-security Kubernetes environment.",
        achievements: [
            "Enhanced data processing efficiency in a leading fraud detection company.",
            "Built modern UIs for financial crime monitoring tools using micro frontends.",
            "Managed application deployments with Docker and Helm in Kubernetes.",
            "Provided technical support and mentorship on IAM systems (Keycloak)."
        ],
        technologies: ["React", "Java", "Quarkus", "Docker", "Kubernetes", "Helm", "Grafana", "Keycloak"],
        // --- NEW: Detailed responsibilities ---
        responsibilities: [
            {
                title: "Backend Development",
                description: "Developed and maintained features for large-scale backend systems, improving data processing efficiency in a leading fraud detection company, working within a high-security environment.",
                timePercentage: 50, // Estimated % of time spent
                technologies: ["Java", "Quarkus"]
            },
            {
                title: "Frontend Development",
                description: "Built modern user interfaces for financial crime monitoring tools using micro frontends.",
                timePercentage: 30,
                technologies: ["React", "TypeScript"]
            },
            {
                title: "DevOps & Deployment",
                description: "Managed application deployments and configurations using Docker containers and Helm charts in a Kubernetes environment.",
                timePercentage: 15,
                technologies: ["Docker", "Kubernetes", "Helm", "Grafana"]
            },
            {
                title: "Mentorship & Support",
                description: "Provided technical support and mentorship to colleagues on Identity and Access Management (IAM) systems.",
                timePercentage: 5,
                technologies: ["Keycloak", "IAM"]
            },
        ]
    },
    {
        role: "Consultant",
        company: "Link Consulting",
        period: "2019 - 2024",
        summary: "Consulted on AI/ML and cloud-native technologies for a leading bank, helping them implement AI-powered chatbots and cloud-native solutions.",
        location: "Lisbon, Portugal",
        // --- NEW: A flexible content array ---
        content: [
            {
                type: 'intro', // An introductory paragraph
                text: "My role began by initiating and engineering a process automation solution for the internal commercial team. By integrating Dynamics CRM with Azure and SharePoint, I built a system that automated project creation, saving significant time and eliminating manual errors. From there, I specialized in architecting and developing sophisticated, client-facing AI and full-stack solutions."
            },
            {
                type: 'project_highlight', // A specific project or area of focus
                title: "AI-Powered Call Center Analytics & Quality Assurance",
                description: "As a full-stack developer, I delivered an innovative AI platform to enhance call center operations. The system leveraged AI to process and analyze call transcriptions, automatically evaluating operator performance against script adherence and quality metrics. I developed the primary user interface—a comprehensive dashboard—that provided managers with clear, data-driven insights, enabling more effective operator coaching and performance evaluation.",
                technologies: ["AI/ML", "React", "Data Visualization"]
            },
            {
                type: 'project_highlight',
                title: "Conversational AI Architecture & Development",
                description: "Architected a secure, scalable conversational AI solution for a major financial institution on Google Cloud Platform. A key feature was a dynamic knowledge base, empowering business users to manage chatbot responses directly. Expanded my AI expertise by delivering additional chatbots for public sector agencies (DGAE, DGC) and a multi-platform (web & mobile) solution for Abu Dhabi Customs using Oracle Digital Assistant.",
                technologies: ["Google Dialogflow", "GCP", "Oracle Digital Assistant", "Chatbots"]
            },
            // You can add more 'project_highlight' or 'intro' blocks here
        ],
        // A comprehensive list of all technologies used during this role
        technologies: ["Azure", "Dialogflow", "GCP", "AdonisJs", "Node.js", "React", "Vue.js", "Quarkus", "Angular"],
        // --- NEW: Detailed responsibilities ---
        responsibilities: [
            {
                title: "Consulting",
                description: "Consulted on AI/ML and cloud-native technologies for a leading bank, helping them implement AI-powered chatbots and cloud-native solutions.",
                timePercentage: 100,
                technologies: ["AI/ML", "Cloud Native"]
            },
        ]
    }
];

export const partnerships = {
    n8n: {
        name: "n8n.io Partner",
        description: "As an official partner, I specialize in building custom workflow automations and integrations using n8n, helping businesses connect disparate systems and streamline their operations.",
        referralUrl: "https://n8n.io/?via=goncalo" // Your referral link
    }
};