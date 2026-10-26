import type { BoardItem } from "./DragBoard";
import Movable from "./Movable";
import { noteStyles, type NoteStyle } from "./notes";
import {
    certifications,
    collection,
    education,
    internships,
    personalInfo,
    projects,
    research,
    skills,
    type Skill,
} from "@/data/portfolio";

export type SectionId =
    | "about"
    | "experience"
    | "research"
    | "projects"
    | "skills"
    | "cv"
    | "contact"
    | "collection";

export const sections: { id: SectionId; title: string; note: string }[] = [
    { id: "about", title: "About", note: "#fff3a8" },
    { id: "experience", title: "Experience", note: "#ffd6c9" },
    { id: "research", title: "Research", note: "#ffe2a8" },
    { id: "projects", title: "Projects", note: "#cdeccd" },
    { id: "skills", title: "Skills", note: "#cfe3ff" },
    { id: "cv", title: "CV", note: "#ffffff" },
    { id: "contact", title: "Contact", note: "#f1d9ff" },
    { id: "collection", title: "Collection", note: "#ffffff" },
];

// Sections whose page is itself a board of pins rather than papers.
export type BoardSectionId =
    | "experience"
    | "research"
    | "projects"
    | "contact"
    | "cv"
    | "collection";
export type PaperSectionId = Exclude<SectionId, BoardSectionId>;
export const isBoardSection = (id: SectionId): id is BoardSectionId =>
    id === "experience" ||
    id === "research" ||
    id === "projects" ||
    id === "contact" ||
    id === "cv" ||
    id === "collection";

// On the Contact and CV boards, dropping a badge opens the link instead of a page.
export const contactLinks: Record<string, string> = {
    github: personalInfo.github,
    linkedin: personalInfo.linkedin,
    email: `mailto:${personalInfo.email}`,
    cv: personalInfo.cv, // downloaded rather than opened
};

const noteColors = ["#fff3a8", "#ffd6c9", "#cdeccd", "#cfe3ff", "#f1d9ff", "#ffe2a8"];
// Souvenirs with room for a title and a subtitle.
const wideBadges = ["ticket", "stamp", "tag", "plaque"];

export const boardItems: Record<BoardSectionId, BoardItem[]> = {
    experience: internships.map((job, i) => ({
        id: job.id,
        title: job.title,
        sub: `${job.company} · ${job.dates.slice(-4)}`,
        note: noteColors[i % noteColors.length],
        rot: [-5, 4, -2, 6, -6][i % 5],
        badge: wideBadges[i % wideBadges.length],
    })),
    research: [
        ...research.map((r, i) => ({
            id: r.id,
            title: r.short,
            sub: r.dates.slice(-4),
            note: noteColors[(i + 2) % noteColors.length],
            rot: [4, -5, 3, -3][i % 4],
            badge: wideBadges[(i + 1) % wideBadges.length],
        })),
        {
            id: "certifications",
            title: "Certifications",
            sub: "& courses",
            note: "#ffffff",
            rot: -4,
            badge: "ticket",
        },
    ],
    projects: projects.map((p, i) => ({
        id: p.id,
        title: p.short ?? p.name,
        sub: p.badge,
        note: noteColors[(i + 3) % noteColors.length],
        rot: [-4, 5, -6, 3, -2, 6][i % 6],
        badge: wideBadges[(i + 2) % wideBadges.length],
    })),
    contact: [
        { id: "github", title: "GitHub", note: "#ffffff", rot: -5, badge: "subway" },
        { id: "linkedin", title: "LinkedIn", note: "#ffffff", rot: 4, badge: "ubahn" },
        { id: "email", title: "Email", note: "#ffffff", rot: -3, badge: "airmail" },
        { id: "cv", title: "Download CV", note: "#ffffff", rot: 5, badge: "luggage" },
    ],
    cv: [{ id: "cv", title: "Download CV", note: "#ffffff", rot: -4, badge: "luggage" }],
    collection: collection.map((b, i) => ({
        id: b.id,
        title: b.name,
        sub: b.place,
        note: "#ffffff",
        rot: [-6, 5, -3, 7, -5, 3][i % 6],
        badge: "collected",
        image: b.image,
    })),
};

export type Detail = {
    title: string;
    meta: string;
    points: { text: string; meta?: string }[];
    tags: string[];
    images: string[];
    photoSlots?: number; // placeholders to show while there are no images
    links?: BoardItem[]; // badges that open a url when dropped, see linkHref
};

// Link badges on a project page, keyed by the ids used in `links`.
const projectLinks = (p: (typeof projects)[number]) => ({
    code: p.github,
    live: p.demo,
});

export function linkHref(section: BoardSectionId, item: string | null, id: string) {
    if (section === "projects") {
        const p = projects.find((x) => x.id === item);
        return p ? projectLinks(p)[id as "code" | "live"] : undefined;
    }
    return contactLinks[id];
}

// What a focused pin shows: its points and images, each as its own pin.
export function detailFor(section: BoardSectionId, id: string): Detail | null {
    if (section === "contact" || section === "cv") return null;
    if (section === "collection") {
        const b = collection.find((x) => x.id === id);
        if (!b) return null;
        return {
            title: b.name,
            meta: b.year ? `${b.place} · ${b.year}` : b.place,
            points: b.story ? [{ text: b.story }] : [],
            tags: [],
            images: b.photos.length ? b.photos : [],
            photoSlots: 3,
        };
    }
    if (section === "projects") {
        const p = projects.find((x) => x.id === id);
        if (!p) return null;
        const links: BoardItem[] = [];
        if (p.github) links.push({ id: "code", title: "GitHub", note: "#ffffff", rot: -4, badge: "tube" });
        if (p.demo)
            links.push({
                id: "live",
                title: p.demo.includes("theforage.com") ? "Forage" : "Live site",
                note: "#ffffff",
                rot: 5,
                badge: "boarding",
            });
        return {
            title: p.name,
            meta: p.badge ?? "Project",
            points: [{ text: p.description }],
            tags: p.stack,
            images: p.images ?? [],
            links,
        };
    }
    if (section === "experience") {
        const job = internships.find((j) => j.id === id);
        if (!job) return null;
        return {
            title: job.title,
            meta: `${job.company} · ${job.dates}`,
            points: job.achievements.map((text) => ({ text })),
            tags: job.technologies,
            images: job.images ?? [],
        };
    }
    if (id === "certifications") {
        return {
            title: "Certifications & courses",
            meta: "Things I've studied alongside my degrees",
            points: certifications.map((c) => ({ text: c.name, meta: `${c.issuer} · ${c.date}` })),
            tags: [],
            images: [],
        };
    }
    const r = research.find((x) => x.id === id);
    if (!r) return null;
    return {
        title: r.title,
        meta: r.dates,
        points: r.points.map((text) => ({ text })),
        tags: [],
        images: r.images ?? [],
    };
}

// A stable, slightly crooked angle per paper so the board feels hand-pinned.
const tilt = (i: number) => `${(((i * 37) % 5) - 2) * 0.5}deg`;

function Paper({
    i,
    wide,
    note,
    children,
}: {
    i: number;
    wide?: boolean;
    note?: NoteStyle;
    children: React.ReactNode;
}) {
    const cls = ["paper"];
    if (wide) cls.push("wide");
    if (note) cls.push("note", note.className);
    return (
        <Movable
            as="article"
            className={cls.join(" ")}
            style={{ ...note?.style, "--rot": tilt(i) } as React.CSSProperties}
        >
            <span className="tack" aria-hidden />
            {children}
        </Movable>
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
    const notes = noteStyles("about", 3);
    return (
        <>
            <Paper i={0} note={notes[0]}>
                <h3>Hi, I&apos;m Efe.</h3>
                <p>{personalInfo.about}</p>
            </Paper>
            <Paper i={1} note={notes[1]}>
                <h3>Education</h3>
                {education.map((e) => (
                    <div key={e.school}>
                        <p className="meta">{e.dates}</p>
                        <p>
                            <strong>{e.school}</strong>
                            <br />
                            {e.degree}
                        </p>
                    </div>
                ))}
                <p className="meta">Based in {personalInfo.location}</p>
            </Paper>
            <Paper i={2} note={notes[2]}>
                <h3>Fun fact</h3>
                <p>{personalInfo.funFact}</p>
            </Paper>
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
    const notes = noteStyles("skills", categories.length);
    return (
        <>
            {categories.map((c, i) => (
                <Paper key={c} i={i} note={notes[i]}>
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

// The CV pinned up beside the Download CV badge on the CV board.
export function CVSheet() {
    return (
        <Movable
            as="article"
            className="paper cv-sheet"
            style={{ "--rot": "-0.5deg" } as React.CSSProperties}
            data-keepout
        >
            <span className="tack" aria-hidden />
            <h3>Curriculum Vitae</h3>
            <p className="meta">One page, PDF, updated for 2026-27</p>
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
        </Movable>
    );
}

export function SectionPapers({ id }: { id: PaperSectionId }) {
    switch (id) {
        case "about":
            return <About />;
        case "skills":
            return <Skills />;
    }
}
