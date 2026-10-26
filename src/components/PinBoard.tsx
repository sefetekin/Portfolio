"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { personalInfo } from "@/data/portfolio";
import { SectionPapers, sections, type SectionId } from "./Papers";

type Spot = { x: number; y: number }; // top-left of a pin, in board pixels
type Spots = Record<SectionId, Spot>;
type Box = { x: number; y: number; w: number; h: number };

type Drag = {
    id: SectionId;
    pointer: number;
    startX: number;
    startY: number;
    from: Spot;
    moved: boolean;
};

const ids = sections.map((s) => s.id);
const isSection = (v: string): v is SectionId =>
    (ids as string[]).includes(v);

// Angles are fixed per pin so server and client render the same markup.
const angles: Record<SectionId, number> = {
    about: -6,
    experience: 4,
    projects: -3,
    skills: 7,
    cv: -8,
    contact: 3,
};

function measure(board: HTMLElement, zone: HTMLElement, pin: HTMLElement) {
    return {
        w: board.clientWidth,
        h: board.clientHeight,
        zone: zone.offsetWidth,
        pw: pin.offsetWidth,
        ph: pin.offsetHeight,
    };
}
type Size = ReturnType<typeof measure>;

const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const shuffle = <T,>(a: T[]) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// Scatter pins over the open part of the board, keeping clear of the
// nameplate, the hint, the drop zone and each other. Pure random placement
// is tried first; on a cramped screen it falls back to a jittered grid.
function scatter(s: Size, keepOut: Box[]): Spots {
    const pad = 14;
    const minX = 16;
    const maxX = Math.max(minX, s.w - s.zone - s.pw - 16);
    const minY = 20;
    const maxY = Math.max(minY, s.h - s.ph - 20);
    const clear = (b: Box, placed: Box[]) =>
        !placed.some((p) => overlaps(b, p)) && !keepOut.some((r) => overlaps(b, r));

    for (let attempt = 0; attempt < 30; attempt++) {
        const placed: Box[] = [];
        const out = {} as Spots;
        for (const id of ids) {
            for (let tries = 0; tries < 200; tries++) {
                const x = minX + Math.random() * (maxX - minX);
                const y = minY + Math.random() * (maxY - minY);
                const box = { x: x - pad, y: y - pad, w: s.pw + pad * 2, h: s.ph + pad * 2 };
                if (clear(box, placed)) {
                    placed.push(box);
                    out[id] = { x, y };
                    break;
                }
            }
            if (!out[id]) break;
        }
        if (Object.keys(out).length === ids.length) return out;
    }

    const top = Math.max(minY, ...keepOut.filter((r) => r.y < s.h / 2).map((r) => r.y + r.h + 8));
    const bottom = Math.min(s.h - 20, ...keepOut.filter((r) => r.y >= s.h / 2).map((r) => r.y - 8));
    const cols = Math.max(1, Math.floor((maxX + s.pw - minX) / (s.pw + pad)));
    const rows = Math.max(1, Math.ceil(ids.length / cols));
    const cw = (maxX + s.pw - minX) / cols;
    const ch = Math.max(s.ph, (bottom - top) / rows);
    const cells = shuffle(
        Array.from({ length: cols * rows }, (_, i) => ({ c: i % cols, r: Math.floor(i / cols) })),
    );
    const out = {} as Spots;
    ids.forEach((id, i) => {
        const { c, r } = cells[i];
        out[id] = {
            x: minX + c * cw + Math.random() * Math.max(0, cw - s.pw),
            y: top + r * ch + Math.random() * Math.max(0, ch - s.ph),
        };
    });
    return out;
}

const zoneSpot = (s: Size): Spot => ({
    x: s.w - s.zone / 2 - s.pw / 2,
    y: s.h / 2 - s.ph / 2,
});

export default function PinBoard() {
    const boardRef = useRef<HTMLDivElement>(null);
    const zoneRef = useRef<HTMLDivElement>(null);
    const pinRefs = useRef<Partial<Record<SectionId, HTMLButtonElement>>>({});
    const keepOutRefs = useRef<(HTMLElement | null)[]>([]);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const drag = useRef<Drag | null>(null);
    const home = useRef<Partial<Spots>>({});
    const openTimer = useRef<number | undefined>(undefined);

    const [spots, setSpots] = useState<Spots | null>(null);
    const [active, setActive] = useState<SectionId | null>(null);
    // The section the panel shows; lingers while the board slides back.
    const [shown, setShown] = useState<SectionId>("about");
    const [dragging, setDragging] = useState<SectionId | null>(null);
    const [hot, setHot] = useState(false);

    const size = useCallback((): Size | null => {
        const board = boardRef.current;
        const zone = zoneRef.current;
        const pin = pinRefs.current.about;
        return board && zone && pin ? measure(board, zone, pin) : null;
    }, []);

    const keepOut = () =>
        keepOutRefs.current
            .filter((el): el is HTMLElement => !!el)
            .map((el) => {
                const r = el.getBoundingClientRect();
                return { x: r.left, y: r.top, w: r.width, h: r.height };
            });

    const open = useCallback(
        (id: SectionId, from: Spot, instant = false) => {
            const s = size();
            if (!s) return;
            home.current[id] = from;
            setSpots((prev) => prev && { ...prev, [id]: zoneSpot(s) });
            setShown(id);
            window.clearTimeout(openTimer.current);
            const go = () => {
                setActive(id);
                history.replaceState(null, "", `#${id}`);
            };
            if (instant) go();
            else openTimer.current = window.setTimeout(go, 380);
        },
        [size],
    );

    const close = useCallback(() => {
        window.clearTimeout(openTimer.current);
        setActive((id) => {
            if (id) {
                const back = home.current[id];
                if (back) setSpots((prev) => prev && { ...prev, [id]: back });
                window.setTimeout(() => pinRefs.current[id]?.focus({ preventScroll: true }), 50);
            }
            return null;
        });
        history.replaceState(null, "", location.pathname + location.search);
    }, []);

    // First layout: scatter the pins, then honour a #section link.
    useEffect(() => {
        const s = size();
        if (!s) return;
        const scattered = scatter(s, keepOut());
        setSpots(scattered);
        const hash = location.hash.slice(1);
        if (isSection(hash)) {
            home.current[hash] = scattered[hash];
            setSpots({ ...scattered, [hash]: zoneSpot(s) });
            setShown(hash);
            setActive(hash);
        }
    }, [size]);

    // Keep pins on the board when the window changes size.
    useEffect(() => {
        let last = size();
        const onResize = () => {
            const s = size();
            if (!s || !last) return;
            const sx = s.w / last.w;
            const sy = s.h / last.h;
            const fit = (p: Spot): Spot => ({
                x: Math.min(Math.max(8, p.x * sx), s.w - s.zone - s.pw - 8),
                y: Math.min(Math.max(8, p.y * sy), s.h - s.ph - 8),
            });
            setSpots((prev) => {
                if (!prev) return prev;
                const next = { ...prev };
                for (const id of ids) {
                    const inZone = prev[id].x + last!.pw / 2 > last!.w - last!.zone;
                    next[id] = inZone ? zoneSpot(s) : fit(prev[id]);
                    const h = home.current[id];
                    if (h) home.current[id] = fit(h);
                }
                return next;
            });
            last = s;
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [size]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [close]);

    useEffect(() => {
        if (active) headingRef.current?.focus({ preventScroll: true });
    }, [active]);

    const onPointerDown = (e: React.PointerEvent, id: SectionId) => {
        if (!spots || e.button !== 0) return;
        if (active && id !== active) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = {
            id,
            pointer: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            from: spots[id],
            moved: false,
        };
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const d = drag.current;
        const s = size();
        if (!d || d.pointer !== e.pointerId || !s || !spots) return;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (!d.moved && Math.hypot(dx, dy) < 5) return;
        if (!d.moved) {
            d.moved = true;
            setDragging(d.id);
            if (!active) home.current[d.id] = d.from;
        }
        // While a page is open only the strip on the left is visible, so
        // the pin may only peek out of it.
        const minX = active ? s.w - s.zone - s.pw * 0.75 : 0;
        const x = Math.min(Math.max(minX, d.from.x + dx), s.w - s.pw);
        const y = Math.min(Math.max(0, d.from.y + dy), s.h - s.ph);
        setSpots({ ...spots, [d.id]: { x, y } });
        setHot(x + s.pw / 2 > s.w - s.zone);
    };

    const onPointerUp = (e: React.PointerEvent) => {
        const d = drag.current;
        if (!d || d.pointer !== e.pointerId) return;
        drag.current = null;
        setDragging(null);
        setHot(false);
        const s = size();
        if (!s || !spots) return;
        const p = spots[d.id];
        const inZone = p.x + s.pw / 2 > s.w - s.zone;
        if (!d.moved) {
            // A plain click or tap: send the pin to the zone, or take it back.
            if (active === d.id) close();
            else open(d.id, p);
            return;
        }
        if (active) {
            if (inZone) setSpots({ ...spots, [d.id]: zoneSpot(s) });
            else close();
        } else if (inZone) {
            open(d.id, d.from);
        }
    };

    const current = sections.find((s) => s.id === shown)!;

    return (
        <main className="viewport">
            <div className={active ? "track cork open" : "track cork"}>
                <div className="board" ref={boardRef} inert={active ? true : undefined}>
                    <header
                        className="nameplate"
                        ref={(el) => {
                            keepOutRefs.current[0] = el;
                        }}
                    >
                        <span className="tape" aria-hidden />
                        <h1>{personalInfo.name}</h1>
                        <p>{personalInfo.tagline}</p>
                    </header>

                    <p
                        className="hint"
                        ref={(el) => {
                            keepOutRefs.current[1] = el;
                        }}
                    >
                        grab a pin, drop it on the right →
                    </p>

                    <div className={hot ? "zone hot" : "zone"} ref={zoneRef} aria-hidden>
                        <div className="zone-ring" />
                        <div className="zone-label">pin here to read</div>
                        <div className="zone-back">pull the pin out to go back</div>
                    </div>
                </div>

                {/* Pins live outside the inert board so the open one stays usable. */}
                <div className="pins" aria-label="Sections">
                    {sections.map((sec) => {
                        const spot = spots?.[sec.id];
                        const isOpen = active === sec.id;
                        const offstage = !!active && !isOpen;
                        const cls = ["pin"];
                        if (dragging === sec.id) cls.push("dragging");
                        if (!spot) cls.push("hidden");
                        return (
                            <button
                                key={sec.id}
                                ref={(el) => {
                                    if (el) pinRefs.current[sec.id] = el;
                                }}
                                className={cls.join(" ")}
                                style={
                                    {
                                        left: spot?.x ?? 0,
                                        top: spot?.y ?? 0,
                                        "--note": sec.note,
                                        "--rot": `${isOpen ? 0 : angles[sec.id]}deg`,
                                    } as React.CSSProperties
                                }
                                tabIndex={offstage ? -1 : 0}
                                aria-hidden={offstage || undefined}
                                aria-label={isOpen ? `Close ${sec.title}` : `Open ${sec.title}`}
                                onPointerDown={(e) => onPointerDown(e, sec.id)}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                                onPointerCancel={onPointerUp}
                                onKeyDown={(e) => {
                                    if (e.key !== "Enter" && e.key !== " ") return;
                                    e.preventDefault();
                                    if (isOpen) close();
                                    else if (spot) open(sec.id, spot);
                                }}
                            >
                                <span className="tack" aria-hidden />
                                <span className="label">{sec.title}</span>
                            </button>
                        );
                    })}
                </div>

                <section
                    className="panel"
                    aria-labelledby="panel-title"
                    inert={active ? undefined : true}
                >
                    <div className="panel-head">
                        <h2 id="panel-title" ref={headingRef} tabIndex={-1}>
                            {current.title}
                        </h2>
                        <button className="back" onClick={close}>
                            ← back to the board
                        </button>
                    </div>
                    <div className={shown === "cv" ? "papers single" : "papers"}>
                        <SectionPapers id={shown} />
                    </div>
                </section>
            </div>
        </main>
    );
}
