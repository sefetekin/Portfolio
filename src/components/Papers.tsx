import {
    internships,
    personalInfo,
    projects,
    skills,
    type Skill,
} from "@/data/portfolio";

export type SectionId =
    | "about"
    | "experience"
    | "projects"
    | "skills"
    | "cv"
    | "contact";

export const sections: { id: SectionId; title: string; note: string }[] = [
    { id: "about", title: "About", note: "#fff3a8" },
    { id: "experience", title: "Experience", note: "#ffd6c9" },
    { id: "projects", title: "Projects", note: "#cdeccd" },
    { id: "skills", title: "Skills", note: "#cfe3ff" },
    { id: "cv", title: "CV", note: "#ffffff" },
    { id: "contact", title: "Contact", note: "#f1d9ff" },
];

// A stable, slightly crooked angle per paper so the board feels hand-pinned.
const tilt = (i: number) => `${(((i * 37) % 5) - 2) * 0.5}deg`;

function Paper({
    i,
    wide,
    children,
}: {
    i: number;
    wide?: boolean;
    children: React.ReactNode;
}) {
    return (
        <article
            className={wide ? "paper wide" : "paper"}
            style={{ "--rot": tilt(i) } as React.CSSProperties}
        >
            <span className="tack" aria-hidden />
            {children}
        </article>
    );
}

function Chips({ items }: { items: string[] }) {
    return (
        <div className="chips">
            {items.map((t) => (
                <span key={t} className="chip">
                    {t}
                </span>
            ))}
        </div>
    );
}

function About() {
    return (
        <>
            <Paper i={0}>
                <h3>Hi, I&apos;m Efe.</h3>
                <p>{personalInfo.about}</p>
            </Paper>
            <Paper i={1}>
                <h3>Education</h3>
                <p>{personalInfo.education}</p>
                <p className="meta">{personalInfo.location}</p>
            </Paper>
            <Paper i={2}>
                <h3>Fun fact</h3>
                <p>{personalInfo.funFact}</p>
            </Paper>
        </>
    );
}

function Experience() {
    return (
        <>
            {internships.map((job, i) => (
                <Paper key={job.id} i={i}>
                    <h3>{job.title}</h3>
                    <p className="meta">
                        {job.company} · {job.dates}
                    </p>
                    <ul>
                        {job.achievements.map((a) => (
                            <li key={a}>{a}</li>
                        ))}
                    </ul>
                    <Chips items={job.technologies} />
                </Paper>
            ))}
        </>
    );
}

function Projects() {
    return (
        <>
            {projects.map((p, i) => (
                <Paper key={p.id} i={i}>
                    {p.badge && <span className="badge">{p.badge}</span>}
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <Chips items={p.stack} />
                    {(p.github || p.demo) && (
                        <div className="links">
                            {p.github && (
                                <a href={p.github} target="_blank" rel="noreferrer">
                                    Code ↗
                                </a>
                            )}
                            {p.demo && (
                                <a href={p.demo} target="_blank" rel="noreferrer">
                                    Live ↗
                                </a>
                            )}
                        </div>
                    )}
                </Paper>
            ))}
        </>
    );
}

function Skills() {
    const categories: Skill["category"][] = [
        "Languages",
        "Frameworks",
        "Tools",
        "Concepts",
    ];
    return (
        <>
            {categories.map((c, i) => (
                <Paper key={c} i={i}>
                    <h3>{c}</h3>
                    <Chips
                        items={skills
                            .filter((s) => s.category === c)
                            .map((s) => s.name)}
                    />
                </Paper>
            ))}
        </>
    );
}

function CV() {
    return (
        <Paper i={1} wide>
            <h3>Curriculum Vitae</h3>
            <p className="meta">PDF · updated by hand, read at your leisure</p>
            <a className="big-link" href={personalInfo.cv} download>
                Download CV
            </a>
            <object
                className="cv-frame"
                data={personalInfo.cv}
                type="application/pdf"
                aria-label="CV preview"
            >
                <p>
                    Your browser can&apos;t preview PDFs here.{" "}
                    <a href={personalInfo.cv}>Open the CV</a> instead.
                </p>
            </object>
        </Paper>
    );
}

function Contact() {
    return (
        <>
            <Paper i={0}>
                <h3>Say hello</h3>
                <p>The quickest way to reach me is email.</p>
                <a className="big-link" href={`mailto:${personalInfo.email}`}>
                    {personalInfo.email}
                </a>
            </Paper>
            <Paper i={1}>
                <h3>Elsewhere</h3>
                <div className="links">
                    <a href={personalInfo.github} target="_blank" rel="noreferrer">
                        GitHub ↗
                    </a>
                    <a href={personalInfo.linkedin} target="_blank" rel="noreferrer">
                        LinkedIn ↗
                    </a>
                </div>
                <p className="meta">{personalInfo.location}</p>
            </Paper>
        </>
    );
}

export function SectionPapers({ id }: { id: SectionId }) {
    switch (id) {
        case "about":
            return <About />;
        case "experience":
            return <Experience />;
        case "projects":
            return <Projects />;
        case "skills":
            return <Skills />;
        case "cv":
            return <CV />;
        case "contact":
            return <Contact />;
    }
}
