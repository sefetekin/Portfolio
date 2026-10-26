export interface Internship {
    id: string;
    title: string;
    company: string;
    dates: string;
    achievements: string[];
    technologies: string[];
    images?: string[]; // paths under public/; placeholders are shown until set
}

export interface Project {
    id: string;
    name: string;
    description: string;
    stack: string[];
    github?: string;
    demo?: string;
    badge?: string;
    image?: string;
}

export interface Skill {
    name: string;
    category: "Languages" | "Frameworks" | "Tools" | "Concepts";
    proficiency: number; // 0-100
}

export const internships: Internship[] = [
    {
        id: "squarepoint-quant",
        title: "Quantitative Developer Intern",
        company: "Squarepoint Capital",
        dates: "Jun 2026 - Sep 2026",
        achievements: [
            "Developed 3 custom trading add-in dashboards on the QUEST platform used by 20+ traders, enhancing quantitative workflows and data visualisation",
            "Modularised core QUEST architecture into 6 reusable components adopted across 5 applications, cutting duplicated code by 50%",
            "Maintained 2-3 mission-critical production applications used daily by 100+ traders, sustaining 99% uptime",
            "Resolved 5 high-priority production errors with an average resolution time of 30 minutes, safeguarding live execution pipelines",
        ],
        technologies: ["QUEST", "Dashboards", "Production Support", "Trading Systems"],
    },
    {
        id: "squarepoint",
        title: "Software Developer Intern",
        company: "Squarepoint Capital",
        dates: "Jun 2025 - Sep 2025",
        achievements: [
            "Analysed FIX message flows from 10+ counterparties to identify counterparty-specific enrichment logic for 15+ downstream fields",
            "Constructed 80+ BDD validation tests per counterparty to verify enrichment behaviour matched requirements",
            "Reduced a 7,000-line key-mapping table by over 50% by removing redundant and invalid JSON entries and enforcing schema validation in GitLab CI",
            "Supported 13 production releases using GitLab CI/CD pipelines, feature/release branching and ticket-driven workflows",
        ],
        technologies: ["Python", "Behave BDD", "FIX Protocol", "GitLab CI/CD", "JSON"],
    },
    {
        id: "avanade",
        title: "Full-Stack Web Developer (Part Time)",
        company: "Avanade",
        dates: "Sep 2024 - Mar 2025",
        achievements: [
            "Built and deployed Dialogue Hub services within Avanade's enterprise Azure environment",
            "Documented architectural decisions on a companion report site following structured DevOps workflows",
            "Established an accessible booking platform for a café supporting people with visual and auditory impairments",
            "Integrated screen reader support, font-size adjustment, high-contrast mode and dyslexia-friendly fonts, following WCAG 2.1 AA",
            "Enabled full voice input and command support via a conversational AI chatbot handling 10 core commands",
        ],
        technologies: ["React", "Flask", "SQL", "Azure", "Accessibility", "DevOps"],
    },
];

export interface Research {
    id: string;
    title: string;
    short: string;
    dates: string;
    points: string[];
    images?: string[]; // paths under public/; placeholders are shown until set
}

export const research: Research[] = [
    {
        id: "games-ml",
        title: "Machine Learning-Driven Content Generation and Adaptation in Video Games",
        short: "ML content generation in games",
        dates: "Sep 2025 - May 2026",
        points: [
            "Applied Phase-Preserving Diffusion to generate in-game assets from player traits and base templates in 5 s each",
            "Integrated a context-aware LLM commentator reacting to live game state and events with 25 ms average latency",
            "Built dynamic difficulty adjustment from 10 gameplay metrics, improving preference by 70% across 15 playtesters",
        ],
    },
    {
        id: "convex-hull",
        title: "Performance Evaluation and Comparative Analysis of Convex Hull Algorithms",
        short: "Convex hull algorithms",
        dates: "Jan 2024 - Mar 2024",
        points: [
            "Benchmarked 3 convex hull algorithms (Graham scan, Jarvis march, Quickhull) on synthetic sets",
        ],
    },
    {
        id: "knee-xray",
        title: "Classifying Knee X-Rays into Categories of Knee Osteoarthritis",
        short: "Knee X-ray classification",
        dates: "Sep 2021 - Apr 2022",
        points: [
            "Trained a CNN (TensorFlow, Python) on 2,000 X-ray images to classify knee osteoarthritis into 3 severity classes",
            "Completed an interdisciplinary research programme with a grade of 92.5/100, top 10% of cohort",
        ],
    },
];

export const certifications = [
    { name: "Getting Started with AI, Agile Explorer & Design Thinking", issuer: "IBM SkillsBuild", date: "Oct 2024" },
    { name: "Software Engineering Virtual Experience", issuer: "J.P. Morgan · Forage", date: "Jan 2024" },
    { name: "Mathematics for Machine Learning Specialisation", issuer: "Imperial College London · Coursera", date: "Sep 2022" },
];

export const projects: Project[] = [
    {
        id: "dialogue-hub",
        name: "Dialogue Hub",
        description:
            "An accessible booking platform and chatbot for a community café supporting people with visual and auditory impairments. Screen reader support, font-size adjustment, high-contrast mode, dyslexia-friendly fonts (WCAG 2.1 AA) and full voice commands.",
        stack: ["React", "Flask", "SQL", "Azure", "Voice Input"],
        badge: "Accessibility",
    },
    {
        id: "unimenti",
        name: "UniMenti",
        description:
            "A mentorship web app for high school students built with MVC principles. Features authentication, search, filtering, and SQL storage for connecting students with mentors.",
        stack: ["C#", ".NET", "MVC", "SQL", "Authentication"],
        github: "https://github.com/sefetekin/UniMentiMVC",
        badge: "Education",
    },
    {
        id: "patients-app",
        name: "Patient Data Management System",
        description:
            "Web system for uploading CSVs, converting to JSON, displaying patient profiles, and visualizing metrics. Built with Java and Maven following MVC architecture.",
        stack: ["Java", "Maven", "MVC", "CSV Processing", "Data Visualization"],
        github: "https://github.com/sefetekin/PatientsApp",
        badge: "Healthcare",
    },
    {
        id: "horizon",
        name: "Horizon",
        description:
            "A Python-based project showcasing data analysis and machine learning capabilities. Features data processing and visualization using modern Python libraries.",
        stack: ["Python", "Data Analysis", "Machine Learning", "Visualization"],
        github: "https://github.com/sefetekin/horizon",
        badge: "Data Science",
    },
    {
        id: "jp-morgan",
        name: "J.P. Morgan Virtual Experience",
        description:
            "Used JPMorgan's Perspective to render live trading data in interactive graphs. Fixed broken local repository setup and gained experience with financial data visualization.",
        stack: [
            "JavaScript",
            "Perspective",
            "Trading Data",
            "Data Visualization",
        ],
        demo: "https://www.theforage.com/virtual-internships/prototype/NPxQvHoQ9w9NQ3uS5/JPMorgan-Software-Engineering-Virtual-Experience",
        badge: "Finance",
    },
    {
        id: "portfolio-website",
        name: "Portfolio Website",
        description:
            "This site: a cork board of draggable pins. Drop a pin on the right to read its pinned pages. Built with Next.js and TypeScript.",
        stack: ["Next.js", "TypeScript", "Pointer Events", "CSS"],
        github: "https://github.com/sefetekin/Portfolio",
        demo: "https://servetefetekin.vercel.app",
        badge: "Web",
    },
];

export const skills: Skill[] = [
    // Languages
    { name: "Python", category: "Languages", proficiency: 90 },
    { name: "Java", category: "Languages", proficiency: 85 },
    { name: "C", category: "Languages", proficiency: 80 },
    { name: "C#", category: "Languages", proficiency: 85 },
    { name: "JavaScript", category: "Languages", proficiency: 80 },
    { name: "SQL", category: "Languages", proficiency: 85 },
    { name: "HTML/CSS", category: "Languages", proficiency: 75 },

    // Frameworks
    { name: ".NET", category: "Frameworks", proficiency: 85 },
    { name: "React", category: "Frameworks", proficiency: 80 },
    { name: "Flask", category: "Frameworks", proficiency: 75 },
    { name: "Entity Framework", category: "Frameworks", proficiency: 80 },
    { name: "TensorFlow", category: "Frameworks", proficiency: 70 },
    { name: "Maven", category: "Frameworks", proficiency: 75 },

    // Tools
    { name: "Git", category: "Tools", proficiency: 90 },
    { name: "GitLab CI/CD", category: "Tools", proficiency: 80 },
    { name: "Azure", category: "Tools", proficiency: 75 },
    { name: "Docker", category: "Tools", proficiency: 70 },
    { name: "Linux", category: "Tools", proficiency: 75 },
    { name: "SQL Server", category: "Tools", proficiency: 80 },
    { name: "GitHub", category: "Tools", proficiency: 90 },
    { name: "PyCharm", category: "Tools", proficiency: 85 },

    // Concepts
    {
        name: "Algorithms & Data Structures",
        category: "Concepts",
        proficiency: 90,
    },
    { name: "MVC Architecture", category: "Concepts", proficiency: 85 },
    { name: "Full-Stack Development", category: "Concepts", proficiency: 80 },
    { name: "Machine Learning", category: "Concepts", proficiency: 75 },
    { name: "Deep Learning", category: "Concepts", proficiency: 75 },
    { name: "Reinforcement Learning", category: "Concepts", proficiency: 70 },
    { name: "Natural Language Processing", category: "Concepts", proficiency: 70 },
    { name: "Diffusion Models & LLMs", category: "Concepts", proficiency: 70 },
    { name: "Accessibility Design", category: "Concepts", proficiency: 80 },
    { name: "CI/CD Workflows", category: "Concepts", proficiency: 80 },
    { name: "DevOps", category: "Concepts", proficiency: 75 },
];

export const education = [
    {
        school: "Imperial College London",
        degree: "MSc Computing (Artificial Intelligence and Machine Learning)",
        dates: "2026 - 2027",
        courses: ["Deep Learning", "Reinforcement Learning", "Natural Language Processing", "ML for Imaging"],
    },
    {
        school: "University College London",
        degree: "BSc Computer Science (1st Class, 73.9%), Minor in Mathematics",
        dates: "2023 - 2026",
        courses: ["Algorithms & Data Structures", "Software Engineering", "Machine Learning", "Financial Mathematics"],
    },
];

export const personalInfo = {
    name: "Servet Efe Tekin",
    tagline: "MSc AI & ML @ Imperial • Software Engineer",
    about: `I'm studying for an MSc in Computing (Artificial Intelligence and Machine Learning) at Imperial College London, after graduating from UCL with a first-class BSc in Computer Science and a minor in Mathematics. Originally from Istanbul, I like building software that makes people's lives easier, from trading tools at Squarepoint Capital, where I've interned twice, to an accessible café booking platform with Avanade. My undergraduate research used diffusion models and LLMs to generate and adapt content in video games.`,
    funFact:
        "I've been playing video games for years - not just for fun, but for the knowledge they provide. They've been my gateway into computer science!",
    location: "London, UK",
    email: "sefetekin@gmail.com",
    github: "https://github.com/sefetekin",
    linkedin: "https://linkedin.com/in/sefetekin",
    website: "https://sefetekin.com",
    cv: "/cv-servet-efetekin.pdf",
};
