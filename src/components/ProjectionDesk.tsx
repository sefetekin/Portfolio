"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
    certifications,
    collection,
    education,
    internships,
    personalInfo,
    projects,
    research,
    type CollectedBadge,
} from "@/data/portfolio";

type ObjectId = "cv" | "experience" | "research" | "projects" | "contact" | "collection";

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
    { id: "experience", label: "EXPERIENCE", meta: `${internships.length} roles`, x: "25%", y: "20%", mx: "40%", my: "13%" },
    { id: "research", label: "RESEARCH", meta: `${research.length} papers`, x: "44%", y: "26%", mx: "52%", my: "33%" },
    { id: "projects", label: "PROJECTS (E:)", meta: `${projects.length} mounted`, x: "12%", y: "62%", mx: "10%", my: "38%" },
    { id: "contact", label: "CONTACT", x: "60%", y: "58%", mx: "74%", my: "60%" },
    { id: "collection", label: "COLLECTION", meta: `${collection.length} pins`, x: "32%", y: "54%", mx: "12%", my: "57%" },
];

const CASE_PREVIEW = ["imperial", "paris", "snorlax", "sevilla", "game-boy", "scotland"];
const GROUPS: CollectedBadge["group"][] = ["Places", "Schools", "Fun finds"];

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
    switch (id) {
        case "cv":
            return (
                <div className="art-cv">
                    {Array.from({ length: 7 }, (_, i) => (
                        <i key={i} />
                    ))}
                </div>
            );
        case "experience":
            return (
                <div className="art-idc">
                    <div className="strap" />
                    <b>SQUAREPOINT</b>
                    <small>Quant dev intern</small>
                    <small>2025 · 2026</small>
                    <div className="chip" />
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
                    <div className="win">
                        {CASE_PREVIEW.map((pid) => {
                            const b = collection.find((c) => c.id === pid);
                            return b?.image ? <img key={pid} src={b.image} alt="" draggable={false} /> : null;
                        })}
                    </div>
                    <div className="gloss" />
                </div>
            );
    }
}

function Collection() {
    const [selected, setSelected] = useState<CollectedBadge>(
        collection.find((c) => c.id === "imperial-alumni") ?? collection[0],
    );
    return (
        <>
            <div className="whybox">
                I pick up a pin wherever I go. This whole site started from them, so the desk is just where I
                keep the case.
            </div>
            <div className="pindetail">
                {selected.image && <img src={selected.image} alt="" />}
                <div>
                    <b>{selected.name}</b>
                    <small>
                        {selected.place}
                        {selected.year ? ` · ${selected.year}` : ""}
                    </small>
                    {selected.story ?? "Trip photos will go here."}
                </div>
            </div>
            {GROUPS.map((g) => {
                const items = collection.filter((c) => c.group === g);
                return (
                    <div className="tray" key={g}>
                        <h3>
                            {g} · {items.length}
                        </h3>
                        <div className="grid">
                            {items.map((b) => (
                                <button
                                    key={b.id}
                                    type="button"
                                    className="pinbtn"
                                    aria-pressed={b.id === selected.id}
                                    onClick={() => setSelected(b)}
                                >
                                    {b.image && <img src={b.image} alt="" />}
                                    <span>{b.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
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

const CONTENT: Record<ObjectId, { kicker: string; title: string; warm?: boolean; body: () => ReactNode }> = {
    cv: {
        kicker: "Document · CV.pdf",
        title: "Curriculum vitae",
        body: () => (
            <>
                {education.map((e) => (
                    <div className="entry" key={e.school}>
                        <h3>{e.school}</h3>
                        <div className="when">
                            {e.degree} · {e.dates}
                        </div>
                        <Chips items={e.courses} />
                    </div>
                ))}
                <div className="entry">
                    <h3>Certifications</h3>
                    <ul>
                        {certifications.map((c) => (
                            <li key={c.name}>
                                {c.name} · {c.issuer}, {c.date}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <a className="btn" href={personalInfo.cv} download>
                        Download CV (PDF)
                    </a>
                </div>
            </>
        ),
    },
    experience: {
        kicker: `ID card · ${internships.length} roles`,
        title: "Experience",
        body: () =>
            internships.map((i) => (
                <div className="entry" key={i.id}>
                    <h3>
                        {i.title} · {i.company}
                    </h3>
                    <div className="when">{i.dates}</div>
                    <ul>
                        {i.achievements.map((a) => (
                            <li key={a}>{a}</li>
                        ))}
                    </ul>
                    <Chips items={i.technologies} />
                </div>
            )),
    },
    research: {
        kicker: `Folder · ${research.length} papers`,
        title: "Research",
        body: () =>
            research.map((r) => (
                <div className="entry" key={r.id}>
                    <h3>{r.title}</h3>
                    <div className="when">{r.dates}</div>
                    <ul>
                        {r.points.map((p) => (
                            <li key={p}>{p}</li>
                        ))}
                    </ul>
                </div>
            )),
    },
    projects: {
        kicker: `Drive E: · ${projects.length} mounted`,
        title: "Projects",
        body: () =>
            projects.map((p) => (
                <div className="entry" key={p.id}>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <Chips items={p.stack} />
                    {(p.github || p.demo) && (
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
                    )}
                </div>
            )),
    },
    contact: { kicker: "Phone · say hi", title: "Contact", body: () => <Contact /> },
    collection: {
        kicker: `Pin case · ${collection.length} pins`,
        title: "The collection",
        warm: true,
        body: () => <Collection />,
    },
};

export default function ProjectionDesk() {
    const surfaceRef = useRef<HTMLDivElement>(null);
    const padRef = useRef<HTMLDivElement>(null);
    const whyRef = useRef<HTMLDivElement>(null);
    const objRefs = useRef<Partial<Record<ObjectId, HTMLDivElement | null>>>({});
    const bodyRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const drag = useRef<{
        id: ObjectId;
        sx: number;
        sy: number;
        l: number;
        t: number;
        kx: number;
        ky: number;
        moved: boolean;
    } | null>(null);

    const [openId, setOpenId] = useState<ObjectId | null>(null);
    const openRef = useRef<ObjectId | null>(null);
    const [armed, setArmed] = useState(false);
    const [scanKey, setScanKey] = useState(0);
    const [dragging, setDragging] = useState<ObjectId | null>(null);
    const [coords, setCoords] = useState("");

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
        openRef.current = null;
        setOpenId(null);
        setArmed(false);
        // the object glides home with a CSS transition; re-anchor the label once it lands
        setTimeout(placeWhy, 550);
    }, [placeWhy]);

    useEffect(() => {
        if (!openId) return;
        if (bodyRef.current) bodyRef.current.scrollTop = 0;
        const t = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 450);
        return () => clearTimeout(t);
    }, [openId]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
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
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(id);
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        const surface = surfaceRef.current;
        if (!d || !surface) return;
        const el = objRefs.current[d.id];
        if (!el) return;
        const dx = (e.clientX - d.sx) / d.kx;
        const dy = (e.clientY - d.sy) / d.ky;
        if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
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
        if (d.moved && overPad(e.clientX, e.clientY)) open(d.id);
        else setArmed(false);
        if (d.id === "collection") placeWhy();
    };

    const content = openId ? CONTENT[openId] : null;

    return (
        <div className="app">
            <div className="top">
                <h1>{personalInfo.name}</h1>
                <p>{personalInfo.location}</p>
            </div>

            <div className={`scene${openId ? " dive" : ""}`}>
                <div className="surface" ref={surfaceRef}>
                    <div className="etch">
                        MSc AI &amp; ML · Imperial College London
                        <small>Software engineer · London, from Istanbul</small>
                    </div>

                    <div className={`pad${armed ? " armed" : ""}`} ref={padRef}>
                        <div className="ring">
                            <span>
                                Projection
                                <br />
                                pad
                            </span>
                        </div>
                        <div className="scanline" key={scanKey} data-run={scanKey > 0 || undefined} />
                    </div>

                    <div className={`proj${openId ? " on" : ""}${content?.warm ? " warm" : ""}`}>
                        <div className="beam" />
                        <div className="idle">
                            Projection area.
                            <br />
                            Slide an object onto the pad above.
                        </div>
                        {content && (
                            <div className="live" role="region" aria-live="polite" aria-labelledby="ptitle" key={openId}>
                                <header>
                                    <div>
                                        <div className="kicker">{content.kicker}</div>
                                        <h2 id="ptitle">{content.title}</h2>
                                    </div>
                                    <button
                                        className="close"
                                        type="button"
                                        ref={closeRef}
                                        onClick={() => {
                                            const cur = openRef.current;
                                            close();
                                            if (cur) objRefs.current[cur]?.focus({ preventScroll: true });
                                        }}
                                    >
                                        Put back ✕
                                    </button>
                                </header>
                                <div className="body" ref={bodyRef}>
                                    {content.body()}
                                </div>
                            </div>
                        )}
                    </div>

                    {OBJECTS.map((o) => (
                        <div
                            key={o.id}
                            ref={(el) => {
                                objRefs.current[o.id] = el;
                            }}
                            className={`obj${dragging === o.id ? " dragging" : ""}${openId === o.id ? " onpad" : ""}`}
                            data-id={o.id}
                            style={{ "--x": o.x, "--y": o.y, "--mx": o.mx, "--my": o.my } as CSSProperties}
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
                    <div className="why" ref={whyRef}>
                        the reason this desk exists
                    </div>
                </div>
            </div>

            <div className="hint">
                Drag any object onto the <b>pad in the top right</b>. Its contents project onto the desk below it.
            </div>
        </div>
    );
}
