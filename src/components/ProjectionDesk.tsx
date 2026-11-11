"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
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

type CardId = "sq-quant" | "sq-dev" | "avanade";
type ObjectId = "cv" | CardId | "research" | "projects" | "contact" | "collection" | "skills";

/** one ID card per role on the desk; `role` is the id in data/portfolio.ts */
const CARDS: Record<CardId, { role: string; org: string; line: string; year: string; tilt: string }> = {
    "sq-quant": { role: "squarepoint-quant", org: "SQUAREPOINT", line: "Quant dev intern", year: "2026", tilt: "0deg" },
    "sq-dev": { role: "squarepoint", org: "SQUAREPOINT", line: "Software dev intern", year: "2025", tilt: "0deg" },
    avanade: { role: "avanade", org: "AVANADE", line: "Full-stack developer", year: "2024 · 25", tilt: "0deg" },
};
const isCard = (id: ObjectId): id is CardId => id in CARDS;
const roleOf = (id: CardId) => internships.find((i) => i.id === CARDS[id].role)!;

interface DeskObject {
    id: ObjectId;
    label: string;
    meta?: string;
    /** desktop position, % of the desk */
    x: string;
    y: string;
    /** how far it slides sideways (in % of the desk width) to clear the centre while a hologram is open */
    dx: number;
    /** phone position, % of the desk */
    mx: string;
    my: string;
}

const OBJECTS: DeskObject[] = [
    { id: "cv", label: "CV.PDF", meta: "2 pages", x: "9%", y: "12%", dx: -6, mx: "6%", my: "6%" },
    { id: "sq-quant", label: "QUANT DEV", meta: "2026", x: "26%", y: "21%", dx: -13, mx: "30%", my: "12%" },
    { id: "sq-dev", label: "SOFTWARE DEV", meta: "2025", x: "40%", y: "8%", dx: -16, mx: "58%", my: "5%" },
    { id: "avanade", label: "AVANADE", meta: "2024", x: "62%", y: "17%", dx: 10, mx: "72%", my: "20%" },
    { id: "research", label: "RESEARCH", meta: `${research.length} papers`, x: "79%", y: "7%", dx: 7, mx: "7%", my: "28%" },
    { id: "contact", label: "CONTACT", x: "84%", y: "44%", dx: 8, mx: "83%", my: "42%" },
    { id: "projects", label: "PROJECTS (E:)", meta: `${projects.length} mounted`, x: "69%", y: "71%", dx: 16, mx: "62%", my: "75%" },
    { id: "skills", label: "SKILLS", meta: `${skills.length} cores`, x: "41%", y: "73%", dx: -14, mx: "43%", my: "63%" },
    { id: "collection", label: "COLLECTION", meta: `${collection.length} pins`, x: "14%", y: "58%", dx: -10, mx: "6%", my: "66%" },
];


function Chips({ items }: { items: string[] }) {
    return (
        <div className="chips">
            {items.map((t) => (
                <span key={t}>{t}</span>
            ))}
        </div>
    );
}

function ObjectArt({ id }: { id: ObjectId }) {
    if (isCard(id)) {
        const c = CARDS[id];
        return (
            <div className={`art-idc idc-${id}`} style={{ "--card-tilt": c.tilt } as CSSProperties}>
                <div className="strap" />
                <b>{c.org}</b>
                <small>{c.line}</small>
                <small>{c.year}</small>
                <div className="chip" />
            </div>
        );
    }
    switch (id) {
        case "cv":
            return (
                <div className="art-cv">
                    {Array.from({ length: 7 }, (_, i) => (
                        <i key={i} />
                    ))}
                </div>
            );
        case "research":
            return (
                <div className="art-folder">
                    <div className="sheet" />
                    <b>RESEARCH</b>
                </div>
            );
        case "projects":
            return <div className="art-usb" />;
        case "skills":
            return (
                <div className="art-chip">
                    <div className="die">
                        <div className="lid">
                            <b>SKILLS</b>
                            <small>{skills.length} cores</small>
                        </div>
                    </div>
                </div>
            );
        case "contact":
            return (
                <div className="art-phone">
                    <div className="scr">HI</div>
                </div>
            );
        case "collection":
            return (
                <div className="art-case">
                    <div className="lid">
                        <span className="plate">PINS</span>
                    </div>
                    <div className="latch" />
                    <div className="gloss" />
                </div>
            );
    }
}

function Gallery({ photos, label, count = 3 }: { photos?: string[]; label: string; count?: number }) {
    const list = photos && photos.length ? photos : Array.from({ length: count }, () => "");
    return (
        <div className="gallery">
            {list.map((src, i) =>
                src ? (
                    <img key={src} src={src} alt={`${label}, photo ${i + 1}`} />
                ) : (
                    <div key={i} className="ph">
                        {label} · photo {i + 1}
                    </div>
                ),
            )}
        </div>
    );
}

function ProjectLinks({ p }: { p: (typeof projects)[number] }) {
    if (!p.github && !p.demo) return null;
    return (
        <div className="links">
            {p.github && (
                <a href={p.github} target="_blank" rel="noopener noreferrer">
                    GitHub ↗
                </a>
            )}
            {p.demo && (
                <a href={p.demo} target="_blank" rel="noopener noreferrer">
                    Live ↗
                </a>
            )}
        </div>
    );
}

function Contact() {
    const [copied, setCopied] = useState(false);
    const mailRef = useRef<HTMLElement>(null);
    const copy = () => {
        const select = () => {
            if (mailRef.current) window.getSelection()?.selectAllChildren(mailRef.current);
        };
        try {
            navigator.clipboard.writeText(personalInfo.email).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }, select);
        } catch {
            select();
        }
    };
    return (
        <>
            <p>Happy to talk about roles, research or pins.</p>
            <div className="copyrow">
                <code ref={mailRef}>{personalInfo.email}</code>
                <button className="btn" type="button" onClick={copy}>
                    {copied ? "Copied" : "Copy email"}
                </button>
            </div>
            <div className="links">
                <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">
                    GitHub ↗
                </a>
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn ↗
                </a>
            </div>
        </>
    );
}

/* ---------- skills network: which skills were used where ---------- */

interface Work {
    id: string;
    kind: "Role" | "Project" | "Research";
    name: string;
    when?: string;
    tags: string[];
    text: string;
}

const WORKS: Work[] = [
    ...internships.map((i) => ({
        id: `role:${i.id}`,
        kind: "Role" as const,
        name: `${i.title} · ${i.company}`,
        when: i.dates,
        tags: i.technologies,
        text: i.achievements.join(" "),
    })),
    ...projects.map((p) => ({
        id: `project:${p.id}`,
        kind: "Project" as const,
        name: p.name,
        tags: p.stack,
        text: p.description,
    })),
    ...research.map((r) => ({
        id: `research:${r.id}`,
        kind: "Research" as const,
        name: r.short,
        when: r.dates,
        tags: [],
        text: `${r.title} ${r.points.join(" ")}`,
    })),
];

/** extra words that count as a mention of a skill */
const ALIASES: Record<string, string[]> = {
    "HTML/CSS": ["HTML", "CSS"],
    "GitLab CI/CD": ["GitLab CI", "GitLab"],
    "MVC Architecture": ["MVC"],
    "Algorithms & Data Structures": ["algorithm", "algorithms"],
    "Machine Learning": ["machine learning", "CNN", "classify"],
    "Deep Learning": ["CNN", "diffusion", "neural"],
    "Diffusion Models & LLMs": ["diffusion", "LLM"],
    "Natural Language Processing": ["LLM", "NLP"],
    "Accessibility Design": ["accessibility", "accessible", "WCAG", "screen reader"],
    "CI/CD Workflows": ["CI/CD", "GitLab CI", "release"],
    "Full-Stack Development": ["full-stack", "web app"],
    DevOps: ["DevOps"],
    Azure: ["Azure"],
    ".NET": [".NET"],
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function mentions(skill: string, w: Work) {
    const terms = [skill, ...(ALIASES[skill] ?? [])];
    const lower = w.tags.map((t) => t.toLowerCase());
    if (terms.some((t) => lower.includes(t.toLowerCase()))) return true;
    if (skill.length <= 2) return false; // "C" would match everything in free text
    return terms.some((t) => new RegExp(`(^|[^\\w])${escapeRe(t)}(?![\\w#+])`, "i").test(w.text));
}
const USES: Record<string, string[]> = Object.fromEntries(
    skills.map((s) => [s.name, WORKS.filter((w) => mentions(s.name, w)).map((w) => w.id)]),
);
const SKILL_CATS: Skill["category"][] = ["Languages", "Frameworks", "Tools", "Concepts"];

const FocusCtx = createContext<{ focus: string | null; setFocus: (id: string | null) => void }>({
    focus: null,
    setFocus: () => {},
});

function SkillsNet() {
    const { focus, setFocus } = useContext(FocusCtx);
    const [active, setActive] = useState<string | null>(null); // a skill name
    const [hoverWork, setHoverWork] = useState<string | null>(null);
    const [lines, setLines] = useState<{ d: string; key: string }[]>([]);
    const rootRef = useRef<HTMLDivElement>(null);
    const opened = focus?.startsWith("skill:") ? skills.find((s) => `skill:${s.name}` === focus) : null;

    // start by tracing the strongest skill, once the hologram has settled
    useEffect(() => {
        const t = setTimeout(() => setActive((a) => a ?? skills[0].name), 900);
        return () => clearTimeout(t);
    }, []);

    // draw curved lines from the active skill to every piece of work that mentions it
    // (or, when hovering a piece of work, from it to every skill it uses)
    const measure = useCallback(() => {
        const root = rootRef.current;
        if (!root) return setLines([]);
        const box = root.getBoundingClientRect();
        // the hologram may be scaled by 3D perspective: convert screen pixels back to its own pixels
        const kx = box.width / (root.offsetWidth || 1);
        const ky = box.height / (root.offsetHeight || 1);
        const pt = (el: Element | null, side: "r" | "l") => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: ((side === "r" ? r.right : r.left) - box.left) / kx, y: (r.top + r.height / 2 - box.top) / ky };
        };
        const pairs: [string, string][] = hoverWork
            ? skills.filter((s) => USES[s.name].includes(hoverWork)).map((s) => [s.name, hoverWork])
            : active
              ? USES[active].map((w) => [active, w])
              : [];
        setLines(
            pairs.flatMap(([s, w]) => {
                const a = pt(root.querySelector(`[data-skill="${CSS.escape(s)}"]`), "r");
                const b = pt(root.querySelector(`[data-work="${CSS.escape(w)}"]`), "l");
                if (!a || !b) return [];
                const mx = (a.x + b.x) / 2;
                return [{ key: `${s}>${w}`, d: `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}` }];
            }),
        );
    }, [active, hoverWork]);
    useLayoutEffect(() => {
        measure();
        const t = setTimeout(measure, 450);
        window.addEventListener("resize", measure);
        return () => {
            clearTimeout(t);
            window.removeEventListener("resize", measure);
        };
    }, [measure, opened]);

    const lit = new Set(hoverWork ? [hoverWork] : active ? USES[active] : []);
    const litSkills = new Set(hoverWork ? skills.filter((s) => USES[s.name].includes(hoverWork)).map((s) => s.name) : active ? [active] : []);

    if (opened) {
        const used = WORKS.filter((w) => USES[opened.name].includes(w.id));
        return (
            <div className="sknet-detail">
                <button type="button" className="back" onClick={() => setFocus(null)}>
                    ← All skills
                </button>
                <span className="hk">{opened.category}</span>
                <h3>{opened.name}</h3>
                <div className="meter" aria-label={`Proficiency ${opened.proficiency} out of 100`}>
                    <i style={{ width: `${opened.proficiency}%` }} />
                </div>
                <h4 className="sub">{used.length ? `Used in ${used.length}` : "Used in"}</h4>
                {used.length ? (
                    <ul className="worklist">
                        {used.map((w) => (
                            <li key={w.id}>
                                <span className="hk">{w.kind}</span> {w.name}
                                {w.when && <span className="when"> · {w.when}</span>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Not tied to a specific role or project on this site yet.</p>
                )}
            </div>
        );
    }

    return (
        <div className="sknet" ref={rootRef} onMouseLeave={() => setHoverWork(null)}>
            <svg className="sklines" aria-hidden="true">
                {lines.map((l) => (
                    <path key={l.key} d={l.d} pathLength={1} />
                ))}
            </svg>
            <div className="skcols">
                {SKILL_CATS.map((cat) => (
                    <div className="skcol" key={cat}>
                        <span className="hk">{cat}</span>
                        {skills
                            .filter((s) => s.category === cat)
                            .map((s) => (
                                <button
                                    key={s.name}
                                    type="button"
                                    className={`skchip${litSkills.has(s.name) ? " lit" : ""}${USES[s.name].length ? "" : " unused"}`}
                                    data-skill={s.name}
                                    aria-pressed={active === s.name}
                                    onMouseEnter={() => {
                                        setHoverWork(null);
                                        setActive(s.name);
                                    }}
                                    onFocus={() => setActive(s.name)}
                                    onClick={() => setActive(s.name)}
                                    onDoubleClick={() => setFocus(`skill:${s.name}`)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            setFocus(`skill:${s.name}`);
                                        }
                                    }}
                                >
                                    <span>{s.name}</span>
                                    <i style={{ width: `${s.proficiency}%` }} />
                                </button>
                            ))}
                    </div>
                ))}
            </div>
            <div className="skworks">
                <span className="hk">Where it was used</span>
                {WORKS.map((w) => (
                    <div
                        key={w.id}
                        className={`work${lit.has(w.id) ? " lit" : ""}`}
                        data-work={w.id}
                        title={w.name}
                        onMouseEnter={() => setHoverWork(w.id)}
                    >
                        <span className="hk">{w.kind}</span>
                        <b>{w.name}</b>
                    </div>
                ))}
            </div>
            <p className="skhint">Hover a skill to trace where it was used · double-click (or Enter) for detail</p>
        </div>
    );
}

/* ---------- holograms: what each scanned object projects above the desk ---------- */

interface HoloItem {
    id: string;
    /** the floating hologram in the set */
    front: ReactNode;
    /** opened view, split into separate hologram blocks; omitted means it can't be opened */
    detail?: ReactNode[];
}
interface HoloSpec {
    kicker: string;
    title: string;
    note?: string;
    warm?: boolean;
    /**
     * arc: a few panels fanned around the object · grid: tiles in a horseshoe · cloud: many small floating items
     * blocks: one subject split into separate, non-interactive blocks around the object · net: one large interactive hologram
     */
    layout: "arc" | "grid" | "cloud" | "blocks" | "net";
    items: HoloItem[];
}

function holoOf(id: ObjectId): HoloSpec {
    if (isCard(id)) {
        const i = roleOf(id);
        return {
            kicker: `ID card · ${i.company}`,
            title: i.title,
            layout: "blocks",
            items: [
                {
                    id: "card",
                    front: (
                        <>
                            <div className="idart">
                                <ObjectArt id={id} />
                            </div>
                            <h3>{i.company}</h3>
                            <div className="when">{i.dates}</div>
                        </>
                    ),
                },
                ...i.achievements.map((a, n) => ({
                    id: `a${n}`,
                    front: (
                        <>
                            <span className="hk">0{n + 1}</span>
                            <p>{a}</p>
                        </>
                    ),
                })),
                {
                    id: "tech",
                    front: (
                        <>
                            <span className="hk">Stack</span>
                            <Chips items={i.technologies} />
                        </>
                    ),
                },
            ],
        };
    }
    switch (id) {
        case "research":
            return {
                kicker: `Folder · ${research.length} papers`,
                title: "Research",
                layout: "arc",
                items: research.map((r) => ({
                    id: r.id,
                    front: (
                        <>
                            <span className="hk">Paper</span>
                            <h3>{r.title}</h3>
                            <div className="when">{r.dates}</div>
                            <small className="hmore">
                                {r.points.length} {r.points.length === 1 ? "finding" : "findings"} · double-click to open
                            </small>
                        </>
                    ),
                    detail: [
                        <>
                            <span className="hk">Paper</span>
                            <h3>{r.title}</h3>
                            <div className="when">{r.dates}</div>
                        </>,
                        ...r.points.map((p, n) => (
                            <>
                                <span className="hk">Finding 0{n + 1}</span>
                                <p>{p}</p>
                            </>
                        )),
                        <>
                            <span className="hk">Figures</span>
                            <Gallery photos={r.images} label="Figure" count={2} />
                        </>,
                    ],
                })),
            };
        case "projects":
            return {
                kicker: `Drive E: · ${projects.length} mounted`,
                title: "Projects",
                layout: "grid",
                items: projects.map((p) => ({
                    id: p.id,
                    front: (
                        <>
                            {p.badge && <span className="hk">{p.badge}</span>}
                            <h3>{p.name}</h3>
                            <small className="hmore">{p.stack.slice(0, 3).join(" · ")}</small>
                        </>
                    ),
                    detail: [
                        <>
                            {p.badge && <span className="hk">{p.badge}</span>}
                            <h3>{p.name}</h3>
                        </>,
                        <>
                            <span className="hk">About</span>
                            <p>{p.description}</p>
                        </>,
                        <>
                            <span className="hk">Stack</span>
                            <Chips items={p.stack} />
                            <ProjectLinks p={p} />
                        </>,
                        <>
                            <span className="hk">Screenshots</span>
                            <Gallery photos={p.images} label="Screenshot" count={2} />
                        </>,
                    ],
                })),
            };
        case "collection":
            return {
                kicker: `Pin case · ${collection.length} pins`,
                title: "The collection",
                note: "I pick up a pin wherever I go. This whole site started from them, so the desk is just where I keep the case.",
                warm: true,
                layout: "cloud",
                items: collection.map((b) => ({
                    id: b.id,
                    front: (
                        <>
                            {b.image && <img src={b.image} alt="" draggable={false} />}
                            <span>{b.name}</span>
                        </>
                    ),
                    detail: [
                        <div className="pinhero" key="hero">
                            {b.image && <img src={b.image} alt={`${b.name} pin`} />}
                            <div>
                                <h3>{b.name}</h3>
                                <small>
                                    {b.place}
                                    {b.year ? ` · ${b.year}` : ""} · {b.group}
                                </small>
                            </div>
                        </div>,
                        <>
                            <span className="hk">Story</span>
                            <p>{b.story ?? "The story behind this pin is coming soon."}</p>
                        </>,
                        <>
                            <span className="hk">From the trip</span>
                            <Gallery photos={b.photos} label={b.name} count={2} />
                        </>,
                    ],
                })),
            };
        case "cv":
            return {
                kicker: "Document · CV.pdf",
                title: "Curriculum vitae",
                layout: "blocks",
                items: [
                    ...education.map((e) => ({
                        id: e.school,
                        front: (
                            <>
                                <span className="hk">Education</span>
                                <h3>{e.school}</h3>
                                <div className="when">
                                    {e.degree} · {e.dates}
                                </div>
                                <Chips items={e.courses} />
                            </>
                        ),
                    })),
                    {
                        id: "certs",
                        front: (
                            <>
                                <span className="hk">Certifications</span>
                                <ul>
                                    {certifications.map((c) => (
                                        <li key={c.name}>
                                            {c.name} · {c.issuer}, {c.date}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ),
                    },
                    {
                        id: "download",
                        front: (
                            <>
                                <span className="hk">Full CV</span>
                                <p>Two pages, PDF.</p>
                                <div>
                                    <a className="btn" href={personalInfo.cv} download>
                                        Download CV
                                    </a>
                                </div>
                            </>
                        ),
                    },
                ],
            };
        case "skills":
            return {
                kicker: `Processor · ${skills.length} cores`,
                title: "Skills",
                layout: "net",
                items: [{ id: "skills", front: <SkillsNet /> }],
            };
        case "contact":
            return {
                kicker: "Handset · say hi",
                title: "Contact",
                layout: "blocks",
                items: [{ id: "contact", front: <Contact /> }],
            };
    }
}

/** Index-based position of an item in its layout, used for the arc and bobbing offsets. */
function slotStyle(layout: HoloSpec["layout"], i: number, n: number): CSSProperties {
    const mid = (n - 1) / 2;
    // -1 … 1 across the set (for the grid, across the 3 columns)
    const k = layout === "grid" ? (i % 3) - 1 : n > 1 ? (i - mid) / mid : 0;
    return {
        "--i": i,
        "--k": k.toFixed(3),
        "--bob": `${(i * 0.37) % 2}s`,
    } as CSSProperties;
}

/**
 * Where a hologram floats in the desk's own 3D space, around the object on the pad.
 * x / y: position on the desk relative to the pad (in % of desk width, y negative = further back),
 * h: height above the desk, w: width, yaw: turn towards the middle (deg). Lengths are in cqw.
 */
type Place = { x: number; y: number; h: number; w: number; yaw: number };
/**
 * n blocks around the object. Up to 3 fan out in a flat arc behind it; more stand in two columns either side,
 * rows stepping back so none hides another (an odd one out sits behind the object).
 */
function ringPlace(i: number, n: number): Place {
    if (n === 1) return { x: 0, y: 5, h: 1, w: 34, yaw: 0 };
    if (n <= 3) {
        const spread = n === 2 ? 110 : 140;
        const t = -spread / 2 + (i * spread) / (n - 1);
        const r = (t * Math.PI) / 180;
        return { x: 30 * Math.sin(r), y: -11 * Math.cos(r), h: 1, w: 23, yaw: 0 };
    }
    if (n % 2 === 1 && i === n - 1) return { x: 0, y: -17, h: 1, w: 19, yaw: 0 };
    const side = i % 2 ? 1 : -1;
    const row = Math.floor(i / 2);
    return { x: side * 29, y: -16 + row * 15, h: 1, w: 19, yaw: -side * 5 };
}
function worldPlace(spec: HoloSpec, i: number, n: number): Place {
    switch (spec.layout) {
        case "cloud": {
            // pins on an ellipse all the way round, leaving a gap at the front for the header
            const t = -150 + (i * 300) / (n - 1);
            const r = (t * Math.PI) / 180;
            return { x: 36 * Math.sin(r), y: -20 * Math.cos(r), h: 2 + (i % 3), w: 7.5, yaw: 0 };
        }
        case "net":
            return { x: 0, y: 6, h: 1, w: 60, yaw: 0 };
        default:
            return ringPlace(i, n);
    }
}
const placeStyle = (p: Place, i: number): CSSProperties =>
    ({
        "--x": p.x.toFixed(2),
        "--y": p.y.toFixed(2),
        "--h": p.h.toFixed(2),
        "--w": p.w.toFixed(2),
        "--yaw": p.yaw.toFixed(1),
        "--i": i,
        "--bob": `${(i * 0.37) % 2}s`,
    }) as CSSProperties;
/** a light trail on the desk from the pad to the foot of a hologram */
const beamStyle = (p: Place, i: number): CSSProperties =>
    ({
        "--len": Math.hypot(p.x, p.y).toFixed(2),
        "--ang": ((Math.atan2(p.y, p.x) * 180) / Math.PI).toFixed(1),
        "--i": i,
    }) as CSSProperties;

function HoloStage({
    spec,
    padRef,
    writing,
    focus,
    setFocus,
    onClose,
    closeRef,
    world,
}: {
    world: boolean;
    spec: HoloSpec;
    padRef: React.RefObject<HTMLDivElement | null>;
    writing: boolean;
    focus: string | null;
    setFocus: (id: string | null) => void;
    onClose: () => void;
    closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const rootRef = useRef<HTMLDivElement>(null);
    const detailRef = useRef<HTMLDivElement>(null);
    const lastFocus = useRef<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);

    // every hologram rises out of the pad: measure the offset from each slot back to the pad, then let CSS fly it in
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (world) return; // in 3D they rise straight out of the pad (CSS), started after fit() below
        const pad = padRef.current?.getBoundingClientRect();
        if (!root || !pad) return;
        const px = pad.left + pad.width / 2;
        const py = pad.top + pad.height / 2;
        root.querySelectorAll<HTMLElement>(".hslot").forEach((el) => {
            const r = el.getBoundingClientRect();
            el.style.setProperty("--fx", `${px - (r.left + r.width / 2)}px`);
            el.style.setProperty("--fy", `${py - (r.top + r.height / 2)}px`);
        });
        root.classList.add("rise");
    }, [padRef, world]);

    // write the text in once the holograms have arrived, and again for an opened item
    useLayoutEffect(() => {
        if (!writing) return;
        const scope = focus ? detailRef.current : rootRef.current;
        if (!scope) return;
        let i = 0;
        scope
            .querySelectorAll<HTMLElement>(".hk, .hnote, h3, .when, p, li, .chips, .links, .btn, .copyrow, .hmore, .pinhero, .sub, .gallery, .skchip, .work")
            .forEach((el) => {
                if (el.parentElement?.closest(".write")) return;
                el.classList.add("write");
                el.style.animationDelay = `${Math.min(i++, 30) * 55}ms`;
            });
    }, [writing, focus]);

    useEffect(() => {
        if (focus) {
            lastFocus.current = focus;
            detailRef.current?.querySelector<HTMLElement>(".back")?.focus({ preventScroll: true });
        } else if (lastFocus.current) {
            rootRef.current?.querySelector<HTMLElement>(`[data-item="${CSS.escape(lastFocus.current)}"]`)?.focus({ preventScroll: true });
        }
    }, [focus]);

    const opened = focus ? spec.items.find((it) => it.id === focus) : null;
    const panelOnly = spec.layout === "blocks" || spec.layout === "net";

    // keep every hologram inside the visible scene: if any block would poke out, shrink the whole set about the pad
    const fit = useCallback((settle = false) => {
        const root = rootRef.current;
        const pad = padRef.current;
        const scene = root?.closest(".scene");
        if (!world || !root || !pad || !scene) return;
        const cur = parseFloat(root.style.getPropertyValue("--fit") || "1");
        const sc = scene.getBoundingClientRect();
        const desk = root.closest(".surface")?.getBoundingClientRect() ?? sc;
        // sideways: stay within the desk; up/down: stay within the visible scene
        const b = { left: desk.left, right: desk.right, top: sc.top, bottom: sc.bottom };
        const m = 6;
        const p = pad.getBoundingClientRect();
        const px = p.left + p.width / 2;
        const py = p.top + p.height / 2;
        const sel = root.classList.contains("focused") ? ".hhead, .hdset > .hslot" : ".hhead, .hset > .hslot";
        // measure where the holograms end up, not where their rise animation currently has them
        if (settle) root.classList.add("measuring");
        let k = Infinity;
        root.querySelectorAll<HTMLElement>(sel).forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.left < px) k = Math.min(k, (px - b.left - m) / (px - r.left));
            if (r.right > px) k = Math.min(k, (b.right - m - px) / (r.right - px));
            if (r.top < py) k = Math.min(k, (py - b.top - m) / (py - r.top));
            if (r.bottom > py) k = Math.min(k, (b.bottom - m - py) / (r.bottom - py));
        });
        if (settle) root.classList.remove("measuring");
        if (!isFinite(k)) return;
        const next = Math.max(0.5, Math.min(1, cur * k));
        if (Math.abs(next - cur) > 0.005) root.style.setProperty("--fit", next.toFixed(3));
    }, [world, padRef]);
    useLayoutEffect(() => {
        fit(true);
        fit(true); // a second pass settles perspective effects
        rootRef.current?.classList.add("rise");
    }, [fit, focus]);
    useEffect(() => {
        const onResize = () => fit();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [fit]);

    const n = spec.items.length;
    return (
        <FocusCtx.Provider value={{ focus, setFocus }}>
            <div
                className={`stage ${world ? "world " : ""}${spec.layout}${spec.warm ? " warm" : ""}${opened ? " focused" : ""}${writing ? " ready" : ""}`}
                ref={rootRef}
                role="region"
                aria-labelledby="ptitle"
            >
                <header
                    className="hhead hslot"
                    style={world ? placeStyle({ x: 0, y: 27, h: 0.5, w: 36, yaw: 0 }, 0) : slotStyle(spec.layout, 0, 1)}
                >
                    <div>
                        <div className="kicker">{spec.kicker}</div>
                        <h2 id="ptitle">
                            {writing ? <Typewriter text={spec.title} speed={35} /> : <span className="sr-only">{spec.title}</span>}
                        </h2>
                        {spec.note && <p className="hnote">{spec.note}</p>}
                    </div>
                    <button className="close" type="button" ref={closeRef} onClick={onClose}>
                        Put back ✕
                    </button>
                </header>

                <div className="hset">
                    {world &&
                        spec.items.map((it, i) => (
                            <i key={`b-${it.id}`} className="beam3d" style={beamStyle(worldPlace(spec, i, n), i)} />
                        ))}
                    {spec.items.map((it, i) => (
                        <div
                            key={it.id}
                            className="hslot"
                            style={world ? placeStyle(worldPlace(spec, i, n), i + 1) : slotStyle(spec.layout, i, n)}
                        >
                            {panelOnly ? (
                                <div className={`hpanel${spec.layout === "net" || n === 1 ? " big" : ""}`}>{it.front}</div>
                            ) : (
                                <button
                                    type="button"
                                    className="hpanel"
                                    data-item={it.id}
                                    aria-pressed={selected === it.id}
                                    onClick={() => setSelected(it.id)}
                                    onDoubleClick={() => it.detail && setFocus(it.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && it.detail) {
                                            e.preventDefault();
                                            setFocus(it.id);
                                        }
                                    }}
                                >
                                    {it.front}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* an opened item: its content split into separate blocks around the object (stacked on phones) */}
                {opened?.detail &&
                    (world ? (
                        <div className="hdset" ref={detailRef} key={opened.id}>
                            {opened.detail.map((_, j) => (
                                <i key={`b${j}`} className="beam3d" style={beamStyle(ringPlace(j, opened.detail!.length), j)} />
                            ))}
                            {opened.detail.map((block, j) => (
                                <div key={j} className="hslot dslot" style={placeStyle(ringPlace(j, opened.detail!.length), j + 1)}>
                                    <div className="hpanel">
                                        {j === 0 && (
                                            <button type="button" className="back" onClick={() => setFocus(null)}>
                                                ← Back
                                            </button>
                                        )}
                                        {block}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="hdetail" ref={detailRef} key={opened.id}>
                            <div className="hpanel big">
                                <button type="button" className="back" onClick={() => setFocus(null)}>
                                    ← Back
                                </button>
                                {opened.detail.map((block, j) => (
                                    <div key={j} className="hblock">
                                        {block}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </FocusCtx.Provider>
    );
}

/** Timeline after an object is dropped (ms from the drop). The object glides ~450ms, then gets scanned. */
const T_LABEL = 1750; // scan done: name the object next to the pad
const T_OUTLINE = 2350; // holograms rise out of the pad
const T_CONTENT = 3050; // they've arrived: write the text in
type Phase = "idle" | "scan" | "label" | "outline" | "content";
const PHASES: Phase[] = ["idle", "scan", "label", "outline", "content"];
const reached = (p: Phase, at: Phase) => PHASES.indexOf(p) >= PHASES.indexOf(at);

function Typewriter({ text, speed = 28 }: { text: string; speed?: number }) {
    const [n, setN] = useState(0);
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setN(text.length);
            return;
        }
        setN(0);
        const t = setInterval(() => setN((k) => (k >= text.length ? (clearInterval(t), k) : k + 1)), speed);
        return () => clearInterval(t);
    }, [text, speed]);
    return (
        <>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
                {text.slice(0, n)}
                {n < text.length && <i className="caret" />}
            </span>
        </>
    );
}

/** Counts up to `to` once, for the scan readouts. */
function Ticker({ to, decimals = 0, ms = 1000 }: { to: number; decimals?: number; ms?: number }) {
    const [v, setV] = useState(0);
    useEffect(() => {
        let raf = 0;
        const t0 = performance.now();
        const step = (t: number) => {
            const k = Math.min(1, (t - t0) / ms);
            setV(to * (1 - Math.pow(1 - k, 3)));
            if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [to, ms]);
    return <>{v.toFixed(decimals)}</>;
}

function Clock() {
    const [now, setNow] = useState("");
    useEffect(() => {
        const fmt = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        const tick = () => setNow(fmt.format(new Date()));
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);
    return <>{now}</>;
}

function readoutOf(id: ObjectId): { type: string; label: string; count: number } {
    if (isCard(id)) return { type: `ID card · ${CARDS[id].org}`, label: "Records", count: roleOf(id).achievements.length };
    switch (id) {
        case "cv":
            return { type: "Document · PDF", label: "Pages", count: 2 };
        case "research":
            return { type: "Folder", label: "Papers", count: research.length };
        case "projects":
            return { type: "Drive E:", label: "Projects", count: projects.length };
        case "contact":
            return { type: "Handset", label: "Channels", count: 3 };
        case "collection":
            return { type: "Pin case", label: "Pins", count: collection.length };
        case "skills":
            return { type: "Processor", label: "Cores", count: skills.length };
    }
}

type Blip = "pick" | "drop" | "scan" | "done";
/** Quiet synthesized UI sounds. Off unless the visitor turns them on. */
function useBlips(on: boolean) {
    const ctx = useRef<AudioContext | null>(null);
    return useCallback(
        (kind: Blip) => {
            if (!on) return;
            try {
                ctx.current ??= new AudioContext();
                const c = ctx.current;
                const t = c.currentTime;
                const [f0, f1, dur, vol, type] = {
                    pick: [880, 1180, 0.06, 0.04, "triangle"],
                    drop: [520, 340, 0.09, 0.04, "triangle"],
                    scan: [260, 820, 1.1, 0.018, "sine"],
                    done: [660, 1320, 0.16, 0.035, "sine"],
                }[kind] as [number, number, number, number, OscillatorType];
                const o = c.createOscillator();
                const g = c.createGain();
                o.type = type;
                o.frequency.setValueAtTime(f0, t);
                o.frequency.exponentialRampToValueAtTime(f1, t + dur);
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
                g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
                o.connect(g).connect(c.destination);
                o.start(t);
                o.stop(t + dur + 0.08);
            } catch {
                /* no audio available */
            }
        },
        [on],
    );
}

const ORBIT_PINS = ["imperial", "paris", "snorlax", "sevilla", "game-boy", "scotland"];

export default function ProjectionDesk() {
    const surfaceRef = useRef<HTMLDivElement>(null);
    const padRef = useRef<HTMLDivElement>(null);
    const whyRef = useRef<HTMLDivElement>(null);
    const objRefs = useRef<Partial<Record<ObjectId, HTMLDivElement | null>>>({});
    const closeRef = useRef<HTMLButtonElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{
        id: ObjectId;
        sx: number;
        sy: number;
        l: number;
        t: number;
        kx: number;
        ky: number;
        moved: boolean;
        // recent pointer velocity in screen px/ms, for throwing
        lx: number;
        ly: number;
        lt: number;
        vx: number;
        vy: number;
    } | null>(null);

    const [openId, setOpenId] = useState<ObjectId | null>(null);
    const openRef = useRef<ObjectId | null>(null);
    const [armed, setArmed] = useState(false);
    const [scanKey, setScanKey] = useState(0);
    const [phase, setPhase] = useState<Phase>("idle");
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };
    const [dragging, setDragging] = useState<ObjectId | null>(null);
    const [coords, setCoords] = useState("");
    const [ghost, setGhost] = useState<{ l: number; t: number; w: number; h: number } | null>(null);
    const [greeting, setGreeting] = useState(false);
    const [focus, setFocus] = useState<string | null>(null);
    // phones get flat, stacked holograms; larger screens get them floating in the desk's 3D space
    const [phone, setPhone] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 640px)");
        const on = () => setPhone(mq.matches);
        on();
        mq.addEventListener("change", on);
        return () => mq.removeEventListener("change", on);
    }, []);
    const focusRef = useRef<string | null>(null);
    focusRef.current = focus;

    const [sound, setSound] = useState(false);
    const blip = useBlips(sound);
    const blipRef = useRef(blip);
    blipRef.current = blip;
    useEffect(() => {
        try {
            setSound(localStorage.getItem("desk-sound") === "on");
        } catch {
            /* storage blocked */
        }
    }, []);
    const toggleSound = () => {
        setSound((s) => {
            try {
                localStorage.setItem("desk-sound", s ? "off" : "on");
            } catch {
                /* storage blocked */
            }
            return !s;
        });
    };

    // first visit: the layout's inline script adds html.boot; end it once the sequence has played
    useEffect(() => {
        const html = document.documentElement;
        if (!html.classList.contains("boot")) return;
        setGreeting(true);
        const a = setTimeout(() => {
            html.classList.remove("boot");
            try {
                localStorage.setItem("desk-booted", "1");
            } catch {
                /* storage blocked */
            }
        }, 2400);
        const b = setTimeout(() => setGreeting(false), 6500);
        return () => {
            clearTimeout(a);
            clearTimeout(b);
        };
    }, []);

    const placeWhy = useCallback(() => {
        const c = objRefs.current.collection;
        const w = whyRef.current;
        if (!c || !w) return;
        w.style.left = `${c.offsetLeft + c.offsetWidth + 30}px`;
        w.style.top = `${c.offsetTop + c.offsetHeight * 0.3}px`;
    }, []);

    const open = useCallback((id: ObjectId) => {
        const el = objRefs.current[id];
        const pad = padRef.current;
        if (!el || !pad) return;
        // snap the object exactly onto the centre of the pad (the pad is placed by its centre: left/top + translate -50%)
        el.style.left = `${pad.offsetLeft - el.offsetWidth / 2}px`;
        el.style.top = `${pad.offsetTop - el.offsetHeight / 2}px`;
        setArmed(true);
        setScanKey((k) => k + 1);
        openRef.current = id;
        setOpenId(id);
        setFocus(null);
        clearTimers();
        const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (quick) {
            setPhase("content");
            return;
        }
        setPhase("scan");
        timers.current = [
            setTimeout(() => blipRef.current("scan"), 450),
            setTimeout(() => {
                setPhase("label");
                blipRef.current("done");
            }, T_LABEL),
            setTimeout(() => setPhase("outline"), T_OUTLINE),
            setTimeout(() => setPhase("content"), T_CONTENT),
        ];
    }, []);

    const close = useCallback(() => {
        const cur = openRef.current;
        if (cur) {
            const el = objRefs.current[cur];
            if (el) {
                el.style.left = "";
                el.style.top = "";
            }
        }
        clearTimers();
        openRef.current = null;
        setOpenId(null);
        setFocus(null);
        setPhase("idle");
        setArmed(false);
        // the object glides home with a CSS transition; re-anchor the label once it lands
        setTimeout(placeWhy, 550);
    }, [placeWhy]);

    useEffect(() => {
        if (phase === "content") closeRef.current?.focus({ preventScroll: true });
    }, [phase, openId]);

    useEffect(() => clearTimers, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (focusRef.current) setFocus(null);
            else close();
        };
        const onResize = () => {
            for (const o of OBJECTS) {
                const el = objRefs.current[o.id];
                if (el && o.id !== openId) {
                    el.style.left = "";
                    el.style.top = "";
                }
            }
            placeWhy();
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("resize", onResize);
        placeWhy();
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", onResize);
        };
    }, [close, openId, placeWhy]);

    // clicking anywhere outside the holograms (and not on another object or the top bar) puts the object back
    useEffect(() => {
        if (!openId) return;
        const onDown = (e: PointerEvent) => {
            const t = e.target as HTMLElement | null;
            if (!t || t.closest(".hpanel, .hslot, .hhead, .stage.cloud .hset, .obj, .top")) return;
            const cur = openRef.current;
            close();
            blipRef.current("drop");
            if (cur) objRefs.current[cur]?.focus({ preventScroll: true });
        };
        window.addEventListener("pointerdown", onDown);
        return () => window.removeEventListener("pointerdown", onDown);
    }, [openId, close]);

    // cursor light on the desk + labels that brighten as the cursor gets near
    useEffect(() => {
        let raf = 0;
        let last: PointerEvent | null = null;
        const frame = () => {
            raf = 0;
            const e = last;
            const surface = surfaceRef.current;
            if (!e || !surface) return;
            // desk-local position: offsetX is in the target's own (untransformed) coordinates
            let el = e.target as HTMLElement | null;
            if (el && surface.contains(el)) {
                let x = e.offsetX;
                let y = e.offsetY;
                while (el && el !== surface) {
                    x += el.offsetLeft;
                    y += el.offsetTop;
                    el = el.offsetParent as HTMLElement | null;
                }
                if (el === surface && glowRef.current) {
                    glowRef.current.style.setProperty("--lx", `${x}px`);
                    glowRef.current.style.setProperty("--ly", `${y}px`);
                    glowRef.current.style.opacity = "1";
                }
            } else if (glowRef.current) glowRef.current.style.opacity = "0";
            for (const o of OBJECTS) {
                const node = objRefs.current[o.id];
                if (!node) continue;
                const r = node.getBoundingClientRect();
                const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
                const near = Math.max(0, Math.min(1, 1 - (d - 40) / 160));
                node.style.setProperty("--near", near.toFixed(2));
            }
        };
        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            last = e;
            if (!raf) raf = requestAnimationFrame(frame);
        };
        window.addEventListener("pointermove", onMove);
        return () => {
            window.removeEventListener("pointermove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    const overPad = (x: number, y: number) => {
        const p = padRef.current?.getBoundingClientRect();
        return !!p && x > p.left && x < p.right && y > p.top && y < p.bottom;
    };

    const onPointerDown = (id: ObjectId) => (e: ReactPointerEvent<HTMLDivElement>) => {
        if (openRef.current) close();
        const surface = surfaceRef.current;
        const el = objRefs.current[id];
        if (!surface || !el) return;
        const r = surface.getBoundingClientRect();
        drag.current = {
            id,
            sx: e.clientX,
            sy: e.clientY,
            l: el.offsetLeft,
            t: el.offsetTop,
            // the desk is tilted, so screen pixels map to fewer desk pixels vertically
            kx: r.width / surface.offsetWidth,
            ky: r.height / surface.offsetHeight,
            moved: false,
            lx: e.clientX,
            ly: e.clientY,
            lt: performance.now(),
            vx: 0,
            vy: 0,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(id);
        blipRef.current("pick");
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        const surface = surfaceRef.current;
        if (!d || !surface) return;
        const el = objRefs.current[d.id];
        if (!el) return;
        const now = performance.now();
        const dt = Math.max(1, now - d.lt);
        d.vx = d.vx * 0.5 + ((e.clientX - d.lx) / dt) * 0.5;
        d.vy = d.vy * 0.5 + ((e.clientY - d.ly) / dt) * 0.5;
        d.lx = e.clientX;
        d.ly = e.clientY;
        d.lt = now;
        const dx = (e.clientX - d.sx) / d.kx;
        const dy = (e.clientY - d.sy) / d.ky;
        if (!d.moved && Math.abs(dx) + Math.abs(dy) > 3) {
            d.moved = true;
            setGhost({ l: d.l, t: d.t, w: el.offsetWidth, h: el.offsetHeight });
        }
        const L = Math.max(0, Math.min(surface.offsetWidth - el.offsetWidth, d.l + dx));
        const T = Math.max(0, Math.min(surface.offsetHeight - el.offsetHeight, d.t + dy));
        el.style.left = `${L}px`;
        el.style.top = `${T}px`;
        setCoords(` x${Math.round(L)} y${Math.round(T)}`);
        setArmed(overPad(e.clientX, e.clientY));
        if (d.id === "collection") placeWhy();
    };

    const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d) return;
        drag.current = null;
        setDragging(null);
        setGhost(null);
        const id = d.id;
        const stale = performance.now() - d.lt > 80; // pointer stopped before release: no throw
        const speed = stale ? 0 : Math.hypot(d.vx, d.vy);
        const later = (fn: () => void) => requestAnimationFrame(() => requestAnimationFrame(fn));
        if (d.moved && overPad(e.clientX, e.clientY)) {
            open(id);
        } else if (d.moved && speed > 0.5) {
            // thrown: does the flick's path cross the pad?
            const hits = [0.1, 0.2, 0.3, 0.4, 0.5].some((k) =>
                overPad(e.clientX + d.vx * 600 * k, e.clientY + d.vy * 600 * k),
            );
            if (hits) later(() => open(id));
            else {
                const surface = surfaceRef.current;
                const el = objRefs.current[id];
                if (surface && el) {
                    const L = Math.max(0, Math.min(surface.offsetWidth - el.offsetWidth, el.offsetLeft + (d.vx / d.kx) * 140));
                    const T = Math.max(0, Math.min(surface.offsetHeight - el.offsetHeight, el.offsetTop + (d.vy / d.ky) * 140));
                    later(() => {
                        el.style.left = `${L}px`;
                        el.style.top = `${T}px`;
                        setTimeout(placeWhy, 550);
                    });
                }
                setArmed(false);
                blipRef.current("drop");
            }
        } else {
            setArmed(false);
            if (d.moved) blipRef.current("drop");
        }
        if (id === "collection") placeWhy();
    };

    const content = openId ? holoOf(openId) : null;
    const readout = openId ? readoutOf(openId) : null;

    return (
        <div className="app">
            <div className="top">
                <h1>{personalInfo.name}</h1>
                <div className="topright">
                    <p>{personalInfo.location}</p>
                    <button
                        type="button"
                        className="sound"
                        aria-pressed={sound}
                        onClick={toggleSound}
                        title={sound ? "Turn sound off" : "Turn sound on"}
                    >
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M2 6h3l4-3v10L5 10H2z" fill="currentColor" />
                            {sound ? (
                                <path d="M11 5.5a3.5 3.5 0 0 1 0 5M12.8 3.5a6 6 0 0 1 0 9" stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinecap="round" />
                            ) : (
                                <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            )}
                        </svg>
                        Sound {sound ? "on" : "off"}
                    </button>
                </div>
            </div>

            <div className={`scene${openId ? " dive" : ""}${openId && reached(phase, "outline") ? " projecting" : ""}`}>
                <div className="surface" ref={surfaceRef}>
                    {/* the desk's thickness: real 3D faces hanging down from the front and sides */}
                    <div className="slab slab-f" aria-hidden="true" />
                    <div className="slab slab-l" aria-hidden="true" />
                    <div className="slab slab-r" aria-hidden="true" />
                    <div className="glow" ref={glowRef} aria-hidden="true" />
                    <div className="etch">
                        MSc AI &amp; ML · Imperial College London
                        <small>Software engineer · London, from Istanbul</small>
                    </div>

                    <div className={`pad${armed ? " armed" : ""}${phase === "scan" ? " scanning" : ""}`} ref={padRef}>
                        <div className="hud" aria-hidden="true">
                            <svg className="r1" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="48" />
                                {Array.from({ length: 36 }, (_, i) => (
                                    <line key={i} x1="50" y1="1" x2="50" y2={i % 3 ? 3.5 : 6} transform={`rotate(${i * 10} 50 50)`} />
                                ))}
                            </svg>
                            <svg className="r2" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" />
                            </svg>
                            <svg className="r3" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="31" />
                            </svg>
                        </div>
                        <div className="ring">
                            <span>
                                Projection
                                <br />
                                pad
                            </span>
                        </div>
                        <div className="hudtxt tl">
                            London <Clock />
                        </div>
                        <div className="hudtxt br">{collection.length} pins logged</div>
                    </div>

                    {openId && reached(phase, "label") && (
                        <div className={`holo${openId === "collection" ? " warm" : ""}`} data-id={openId} key={`h-${scanKey}`} aria-hidden="true">
                            <div className="spin">
                                <ObjectArt id={openId} />
                            </div>
                        </div>
                    )}

                    {openId === "collection" && reached(phase, "label") && (
                        <div className={`orbitwrap${phase === "content" ? " leaving" : ""}`} key={`o-${scanKey}`} aria-hidden="true">
                            <div className="orbit">
                                {ORBIT_PINS.map((pid, i) => {
                                    const b = collection.find((c) => c.id === pid);
                                    if (!b?.image) return null;
                                    return (
                                        <div className="orb" key={pid} style={{ "--a": `${(i * 360) / ORBIT_PINS.length}deg` } as CSSProperties}>
                                            <div className="orbpin">
                                                <img src={b.image} alt="" draggable={false} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {openId && reached(phase, "label") && phase !== "content" && content && (
                        <div className={`ident${content.warm ? " warm" : ""}`} key={`id-${scanKey}`}>
                            <small>Scan complete</small>
                            <b>
                                <Typewriter text={content.kicker} />
                            </b>
                        </div>
                    )}

                    {ghost && (
                        <div
                            className="ghost"
                            aria-hidden="true"
                            style={{ left: ghost.l, top: ghost.t, width: ghost.w, height: ghost.h }}
                        />
                    )}

                    {OBJECTS.map((o, i) => (
                        <div
                            key={o.id}
                            ref={(el) => {
                                objRefs.current[o.id] = el;
                            }}
                            className={`obj${dragging === o.id ? " dragging" : ""}${openId === o.id ? " onpad" : ""}`}
                            data-id={o.id}
                            style={{ "--x": o.x, "--y": o.y, "--dx": o.dx, "--mx": o.mx, "--my": o.my, "--i": i } as CSSProperties}
                            tabIndex={0}
                            role="button"
                            aria-label={`Open ${o.label.toLowerCase()}`}
                            onPointerDown={onPointerDown(o.id)}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    open(o.id);
                                }
                            }}
                        >
                            <ObjectArt id={o.id} />
                            <div className="frame" />
                            {openId === o.id && <div className="scan" key={scanKey} aria-hidden="true" />}
                            {openId === o.id && phase === "scan" && readout && (
                                <div className="lock" aria-hidden="true" key={`l-${scanKey}`}>
                                    <i className="c1" />
                                    <i className="c2" />
                                    <i className="c3" />
                                    <i className="c4" />
                                    <div className="readout">
                                        <span>Analysing</span>
                                        <span>{readout.type}</span>
                                        <span>
                                            {readout.label} <Ticker to={readout.count} ms={900} />
                                        </span>
                                        <span>
                                            Match <Ticker to={99.2} decimals={1} ms={1100} />%
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="tag">
                                {o.label}
                                {dragging === o.id ? (
                                    <em>{coords}</em>
                                ) : (
                                    o.meta && <em> · {o.meta}</em>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className={`why${dragging === "collection" ? " lifted" : ""}`} ref={whyRef}>
                        the reason this desk exists
                    </div>

                    {!phone && openId && content && reached(phase, "outline") && (
                    <HoloStage
                        world={true}
                        key={`stage-${scanKey}`}
                        spec={content}
                        padRef={padRef}
                        writing={phase === "content"}
                        focus={focus}
                        setFocus={setFocus}
                        closeRef={closeRef}
                        onClose={() => {
                            const cur = openRef.current;
                            close();
                            blipRef.current("drop");
                            if (cur) objRefs.current[cur]?.focus({ preventScroll: true });
                        }}
                    />)}
                </div>
                {phone && openId && content && reached(phase, "outline") && (
                    <HoloStage
                        world={false}
                        key={`stage-${scanKey}`}
                        spec={content}
                        padRef={padRef}
                        writing={phase === "content"}
                        focus={focus}
                        setFocus={setFocus}
                        closeRef={closeRef}
                        onClose={() => {
                            const cur = openRef.current;
                            close();
                            blipRef.current("drop");
                            if (cur) objRefs.current[cur]?.focus({ preventScroll: true });
                        }}
                    />)}


            </div>

            <div className="hint">
                {greeting ? (
                    <Typewriter text={`Welcome. ${OBJECTS.length} objects on the desk. Drag one onto the pad to scan it.`} speed={22} />
                ) : (
                    <>
                        Drag any object onto the <b>scanner pad</b> in the middle, or flick it there. Its hologram rises
                        above the desk.
                    </>
                )}
            </div>
        </div>
    );
}
