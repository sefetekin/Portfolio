export interface Internship {
    id: string;
    title: string;
    company: string;
    dates: string;
    achievements: string[];
    technologies: string[];
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
        id: "squarepoint",
        title: "Software Engineering Intern",
        company: "Squarepoint Capital",
        dates: "Jun 2025 - Sept 2025",
        achievements: [
            "Investigated FIX messages from 10+ counterparties and trade input routing for 100,000 daily messages",
            "Individualized enrichment logic to reduce routing table size and improve message processing efficiency",
            "Built custom FIX message tests using Behave BDD framework with .feature files for validation",
            "Designed automated weekly cleanup process for 7,000-line JSON key-mapping table with CI schema validation",
            "Managed GitLab CI/CD pipelines and coordinated production releases with approval-driven workflows",
        ],
        technologies: [
            "Python",
            "Behave BDD",
            "GitLab CI/CD",
            "FIX Protocol",
            "JSON",
            "Git",
        ],
    },
    {
        id: "avanade",
        title: "Full-Stack Web Developer (Part Time)",
        company: "Avanade",
        dates: "Sept 2024 - March 2025",
        achievements: [
            "Partnered with Avanade on university-industry project to design and deploy Dialogue Hub using Azure tools",
            "Built and deployed services within Avanade's enterprise Azure environment",
            "Documented architectural decisions and followed structured DevOps workflows",
            "Developed accessible chatbot platform for community café supporting visual and auditory impairments",
        ],
        technologies: [
            "React",
            "Flask",
            "SQL",
            "Azure",
            "Accessibility Design",
            "DevOps",
        ],
    },
    {
        id: "koda",
        title: "Software Engineering Intern",
        company: "Ergun Holding - Koda Technologies",
        dates: "Jun 2024 - July 2024",
        achievements: [
            "Developed Garanti Barter website and SQL-based database for 200+ companies using MVC architecture",
            "Implemented .NET and Entity Framework for full-stack development",
            "Shadowed full-stack team on 9-month B2B product for 500+ users",
            "Gained experience in enterprise software development and database management",
        ],
        technologies: ["C#", ".NET", "Entity Framework", "SQL", "MVC", "B2B"],
    },
];

export const projects: Project[] = [
    {
        id: "dialogue-hub",
        name: "Dialogue Hub",
        description:
            "An accessible chatbot platform for community café supporting people with visual and auditory impairments. Features screen reader support, font-size adjustment, high-contrast mode, and dyslexia-friendly options.",
        stack: ["React", "Flask", "SQL", "Accessibility Design", "Voice Input"],
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
    { name: "Accessibility Design", category: "Concepts", proficiency: 80 },
    { name: "CI/CD Workflows", category: "Concepts", proficiency: 80 },
    { name: "DevOps", category: "Concepts", proficiency: 75 },
];

export const personalInfo = {
    name: "Servet Efe Tekin",
    tagline: "2nd Year CS Student @UCL • Software Engineer • Tech Enthusiast",
    subtitle: "Building accessible tech. Exploring the future.",
    about: `I'm a Second-Year BSc Computer Science student at University College London (UCL) with a minor in Mathematics, 
    achieving a 1st Class standing (74.3%). Originally from Istanbul, Turkey, I'm passionate about software engineering 
    and making people's lives easier through technology. I'm a founding member and treasurer of the UCL Game Development 
    Society, and treasurer of the Turkish Society. My experience spans from high-frequency trading systems at Squarepoint 
    Capital to accessible web development at Avanade.`,
    funFact:
        "I've been playing video games for years - not just for fun, but for the knowledge they provide. They've been my gateway into computer science!",
    education:
        "BSc Computer Science (1st Class, 74.3%), Minor in Mathematics, University College London (UCL)",
    location: "London, UK",
    email: "sefetekin@gmail.com",
    phone: "+44 7748651665",
    github: "https://github.com/sefetekin",
    linkedin: "https://linkedin.com/in/efe-tekin",
    website: "https://servetefetekin.com",
    cv: "/cv-servet-efetekin.pdf",
};
