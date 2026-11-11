"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
    certifications,
    collection,
    education,
    internships,
    personalInfo,
    projects,
    research,
} from "@/data/portfolio";

type CardId = "sq-quant" | "sq-dev" | "avanade";
type ObjectId = "cv" | CardId | "research" | "projects" | "contact" | "collection";

/** one ID card per role on the desk; `role` is the id in data/portfolio.ts */
const CARDS: Record<CardId, { role: string; org: string; line: string; year: string; tilt: string }> = {
    "sq-quant": { role: "squarepoint-quant", org: "SQUAREPOINT", line: "Quant dev intern", year: "2026", tilt: "-5deg" },
    "sq-dev": { role: "squarepoint", org: "SQUAREPOINT", line: "Software dev intern", year: "2025", tilt: "3deg" },
    avanade: { role: "avanade", org: "AVANADE", line: "Full-stack developer", year: "2024 · 25", tilt: "-2deg" },
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
    /** phone position, % of the desk */
    mx: string;
    my: string;
}

const OBJECTS: DeskObject[] = [
    { id: "cv", label: "CV.PDF", meta: "2 pages", x: "9%", y: "22%", mx: "7%", my: "10%" },
    { id: "sq-quant", label: "QUANT DEV", meta: "2026", x: "20.5%", y: "14%", mx: "35%", my: "5.5%" },
    { id: "sq-dev", label: "SOFTWARE DEV", meta: "2025", x: "31%", y: "20%", mx: "35%", my: "19.5%" },
    { id: "avanade", label: "AVANADE", meta: "2024", x: "43%", y: "15%", mx: "35%", my: "33.5%" },
    { id: "research", label: "RESEARCH", meta: `${research.length} papers`, x: "48%", y: "30%", mx: "58%", my: "35%" },
    { id: "projects", label: "PROJECTS (E:)", meta: `${projects.length} mounted`, x: "12%", y: "62%", mx: "8%", my: "47%" },
    { id: "contact", label: "CONTACT", x: "60%", y: "58%", mx: "74%", my: "63%" },
    { id: "collection", label: "COLLECTION", meta: `${collection.length} pins`, x: "32%", y: "54%", mx: "12%", my: "61%" },
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

/* ---------- holograms: what each scanned object projects above the desk ---------- */

interface HoloItem {
    id: string;
    /** the floating hologram in the set */
    front: ReactNode;
    /** the expanded view when the item is opened; omitted means it can't be opened further */
    detail?: ReactNode;
}
interface HoloSpec {
    kicker: string;
    title: string;
    note?: string;
    warm?: boolean;
    /** arc: a few panels fanned in an arc · grid: tiles · cloud: many small floating items · single: one large hologram */
    layout: "arc" | "grid" | "cloud" | "single";
    items: HoloItem[];
}

function holoOf(id: ObjectId): HoloSpec {
    if (isCard(id)) {
        const i = roleOf(id);
        return {
            kicker: `ID card · ${i.company}`,
            title: i.title,
            layout: "single",
            items: [
                {
                    id,
                    front: (
                        <div className="idholo">
                            <div className="idart">
                                <ObjectArt id={id} />
                            </div>
                            <div className="entry">
                                <h3>{i.company}</h3>
                                <div className="when">{i.dates}</div>
                                <ul>
                                    {i.achievements.map((a) => (
                                        <li key={a}>{a}</li>
                                    ))}
                                </ul>
                                <Chips items={i.technologies} />
                            </div>
                        </div>
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
                            <p className="hsum">{r.points[0]}</p>
                            <small className="hmore">
                                {r.points.length} {r.points.length === 1 ? "finding" : "findings"} · double-click to open
                            </small>
                        </>
                    ),
                    detail: (
                        <>
                            <h3>{r.title}</h3>
                            <div className="when">{r.dates}</div>
                            <ul>
                                {r.points.map((p) => (
                                    <li key={p}>{p}</li>
                                ))}
                            </ul>
                            <h4 className="sub">Figures</h4>
                            <Gallery photos={r.images} label="Figure" count={2} />
                        </>
                    ),
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
                    detail: (
                        <>
                            {p.badge && <span className="hk">{p.badge}</span>}
                            <h3>{p.name}</h3>
                            <p>{p.description}</p>
                            <Chips items={p.stack} />
                            <ProjectLinks p={p} />
                            <h4 className="sub">Screenshots</h4>
                            <Gallery photos={p.images} label="Screenshot" count={2} />
                        </>
                    ),
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
                    detail: (
                        <>
                            <div className="pinhero">
                                {b.image && <img src={b.image} alt={`${b.name} pin`} />}
                                <div>
                                    <h3>{b.name}</h3>
                                    <small>
                                        {b.place}
                                        {b.year ? ` · ${b.year}` : ""} · {b.group}
                                    </small>
                                </div>
                            </div>
                            <p>{b.story ?? "The story behind this pin is coming soon."}</p>
                            <h4 className="sub">From the trip</h4>
                            <Gallery photos={b.photos} label={b.name} />
                        </>
                    ),
                })),
            };
        case "cv":
            return {
                kicker: "Document · CV.pdf",
                title: "Curriculum vitae",
                layout: "arc",
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
                                <div>
                                    <a className="btn" href={personalInfo.cv} download>
                                        Download CV (PDF)
                                    </a>
                                </div>
                            </>
                        ),
                    },
                ],
            };
        case "contact":
            return {
                kicker: "Handset · say hi",
                title: "Contact",
                layout: "single",
                items: [{ id: "contact", front: <Contact /> }],
            };
    }
}

/** Index-based position of an item in its layout, used for the arc and bobbing offsets. */
function slotStyle(layout: HoloSpec["layout"], i: number, n: number): CSSProperties {
    const mid = (n - 1) / 2;
    const k = n > 1 ? (i - mid) / mid : 0; // -1 … 1 across the set
    return {
        "--i": i,
        "--k": k.toFixed(3),
        "--bob": `${(i * 0.37) % 2}s`,
    } as CSSProperties;
}

function HoloStage({
    spec,
    padRef,
    writing,
    focus,
    setFocus,
    onClose,
    closeRef,
}: {
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
    }, [padRef]);

    // write the text in once the holograms have arrived, and again for an opened item
    useLayoutEffect(() => {
        if (!writing) return;
        const scope = focus ? detailRef.current : rootRef.current;
        if (!scope) return;
        let i = 0;
        scope
            .querySelectorAll<HTMLElement>(".hk, .hnote, h3, .when, p, li, .chips, .links, .btn, .copyrow, .hmore, .pinhero, .sub, .gallery")
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
    const single = spec.layout === "single";

    return (
        <div
            className={`stage ${spec.layout}${spec.warm ? " warm" : ""}${opened ? " focused" : ""}${writing ? " ready" : ""}`}
            ref={rootRef}
            role="region"
            aria-labelledby="ptitle"
        >
            <header className="hhead hslot" style={slotStyle(spec.layout, 0, 1)}>
                <div>
                    <div className="kicker">{spec.kicker}</div>
                    <h2 id="ptitle">{writing ? <Typewriter text={spec.title} speed={35} /> : <span className="sr-only">{spec.title}</span>}</h2>
                    {spec.note && <p className="hnote">{spec.note}</p>}
                </div>
                <button className="close" type="button" ref={closeRef} onClick={onClose}>
                    Put back ✕
                </button>
            </header>

            <div className="hset">
                {spec.items.map((it, i) =>
                    single ? (
                        <div key={it.id} className="hslot" style={slotStyle(spec.layout, i, spec.items.length)}>
                            <div className="hpanel big">{it.front}</div>
                        </div>
                    ) : (
                        <div key={it.id} className="hslot" style={slotStyle(spec.layout, i, spec.items.length)}>
                            <button
                                type="button"
                                className="hpanel"
                                data-item={it.id}
                                aria-pressed={selected === it.id}
                                aria-label={spec.layout === "cloud" ? undefined : undefined}
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
                        </div>
                    ),
                )}
            </div>

            {opened?.detail && (
                <div className="hdetail" ref={detailRef} key={opened.id}>
                    <div className="hpanel big">
                        <button type="button" className="back" onClick={() => setFocus(null)}>
                            ← Back
                        </button>
                        {opened.detail}
                    </div>
                </div>
            )}
        </div>
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
        // snap the object onto the centre of the pad
        el.style.left = `${pad.offsetLeft + pad.offsetWidth / 2 - el.offsetWidth / 2}px`;
        el.style.top = `${pad.offsetTop + pad.offsetHeight / 2 - el.offsetHeight / 2}px`;
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

    // cursor light on the grid + labels that brighten as the cursor gets near
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

            <div className={`scene${openId ? " dive" : ""}`}>
                <div className="surface" ref={surfaceRef}>
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

                    {openId && reached(phase, "label") && content && (
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
                            style={{ "--x": o.x, "--y": o.y, "--mx": o.mx, "--my": o.my, "--i": i } as CSSProperties}
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
                </div>

                {openId && content && reached(phase, "outline") && (
                    <HoloStage
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
                    />
                )}
            </div>

            <div className="hint">
                {greeting ? (
                    <Typewriter text={`Welcome. ${OBJECTS.length} objects on the desk. Drag one onto the pad to scan it.`} speed={22} />
                ) : (
                    <>
                        Drag any object onto the <b>pad in the top right</b>, or flick it there. Its contents project
                        onto the desk below it.
                    </>
                )}
            </div>
        </div>
    );
}
