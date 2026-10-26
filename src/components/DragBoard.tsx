"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type BoardItem = {
    id: string;
    title: string;
    sub?: string;
    note: string;
    rot: number;
    badge?: string; // souvenir style, see .b-* in globals.css
};

type Spot = { x: number; y: number }; // top-left of a pin, in board pixels
type Spots = Record<string, Spot>;
type Box = { x: number; y: number; w: number; h: number };
type Size = { w: number; h: number; zone: number; pw: number; ph: number };
// A pin is either resting in the cloth, pulled out or being pressed back in.
type Phase = "out" | "in";

const FLIGHT_MS = 420; // matches the left/top transition on .pin
const PUSH_MS = 360;
const MAX_HOLES = 60;

type Drag = {
    id: string;
    pointer: number;
    startX: number;
    startY: number;
    from: Spot;
    moved: boolean;
};

const overlaps = (a: Box, b: Box) =>
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const shuffle = <T,>(a: T[]) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// Scatter pins over the open part of the board, keeping clear of the
// decorations, the drop zone and each other. Pure random placement is
// tried first; on a cramped screen it falls back to a jittered grid.
function scatter(ids: string[], s: Size, keepOut: Box[]): Spots {
    const pad = 14;
    const minX = 16;
    const maxX = Math.max(minX, s.w - s.zone - s.pw - 16);
    const minY = 20;
    const maxY = Math.max(minY, s.h - s.ph - 20);
    const clear = (b: Box, placed: Box[]) =>
        !placed.some((p) => overlaps(b, p)) && !keepOut.some((r) => overlaps(b, r));

    for (let attempt = 0; attempt < 30; attempt++) {
        const placed: Box[] = [];
        const out: Spots = {};
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
    const out: Spots = {};
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

const inZone = (p: Spot, s: Size) => p.x + s.pw / 2 > s.w - s.zone;

/**
 * A cork board of draggable pins with a drop zone on its right. Dropping or
 * clicking a pin parks it in the zone and calls onOpen; pulling it back out
 * (or clicking it again) calls onClose. `active` is controlled by the parent,
 * so a back button or a deep link moves the pins too.
 *
 * Decorations passed as children get a `data-keepout` attribute to keep
 * pins from landing on them.
 */
export default function DragBoard({
    items,
    active,
    onOpen,
    onClose,
    className,
    zoneLabel,
    zoneBack,
    pinClass = "pin",
    children,
}: {
    items: BoardItem[];
    active: string | null;
    onOpen: (id: string) => void;
    onClose: () => void;
    className?: string;
    zoneLabel: string;
    zoneBack: string;
    pinClass?: string;
    children?: React.ReactNode;
}) {
    const boardRef = useRef<HTMLDivElement>(null);
    const zoneRef = useRef<HTMLDivElement>(null);
    const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const drag = useRef<Drag | null>(null);
    const home = useRef<Spots>({});
    const openTimer = useRef<number | undefined>(undefined);
    const lastActive = useRef<string | null>(null);
    const pushTimers = useRef<Record<string, number>>({});
    const pulled = useRef(new Set<string>()); // pins currently out of the cloth

    const [spots, setSpots] = useState<Spots | null>(null);
    const [phase, setPhase] = useState<Record<string, Phase>>({});
    const [holes, setHoles] = useState<Spot[]>([]);
    const [dragging, setDragging] = useState<string | null>(null);
    const [hot, setHot] = useState(false);

    const size = useCallback((): Size | null => {
        const board = boardRef.current;
        const zone = zoneRef.current;
        const pin = items[0] && pinRefs.current[items[0].id];
        if (!board || !zone || !pin) return null;
        return {
            w: board.clientWidth,
            h: board.clientHeight,
            zone: zone.offsetWidth,
            pw: pin.offsetWidth,
            ph: pin.offsetHeight,
        };
    }, [items]);

    // Pulling a pin out leaves a puncture where its needle was.
    const pullOut = useCallback(
        (id: string, at: Spot) => {
            const s = size();
            if (!s) return;
            window.clearTimeout(pushTimers.current[id]);
            if (pulled.current.has(id)) return;
            pulled.current.add(id);
            const hole = { x: at.x + s.pw / 2, y: at.y + s.ph / 2 + 10 };
            setHoles((prev) =>
                prev.some((h) => Math.hypot(h.x - hole.x, h.y - hole.y) < 4)
                    ? prev
                    : [...prev, hole].slice(-MAX_HOLES),
            );
            setPhase((p) => ({ ...p, [id]: "out" }));
        },
        [size],
    );

    // Press the pin back into the cloth once it has landed.
    const pushIn = useCallback((id: string, after: number) => {
        window.clearTimeout(pushTimers.current[id]);
        pushTimers.current[id] = window.setTimeout(() => {
            pulled.current.delete(id);
            setPhase((p) => ({ ...p, [id]: "in" }));
            pushTimers.current[id] = window.setTimeout(() => {
                setPhase((p) => {
                    const next = { ...p };
                    delete next[id];
                    return next;
                });
            }, PUSH_MS);
        }, after);
    }, []);

    // Park a pin in the zone, remembering where it came from, then open it
    // once it has landed.
    const park = useCallback(
        (id: string, from: Spot, pulled = false) => {
            const s = size();
            if (!s) return;
            if (!pulled) pullOut(id, from);
            pushIn(id, FLIGHT_MS);
            home.current[id] = from;
            setSpots((prev) => prev && { ...prev, [id]: zoneSpot(s) });
            window.clearTimeout(openTimer.current);
            openTimer.current = window.setTimeout(() => onOpen(id), 380);
        },
        [size, onOpen, pullOut, pushIn],
    );

    // First layout: scatter the pins. Runs again if the items change.
    useEffect(() => {
        const board = boardRef.current;
        const s = size();
        if (!board || !s) return;
        const origin = board.getBoundingClientRect();
        const keepOut = Array.from(board.querySelectorAll<HTMLElement>("[data-keepout]")).map(
            (el) => {
                const r = el.getBoundingClientRect();
                return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
            },
        );
        const scattered = scatter(
            items.map((i) => i.id),
            s,
            keepOut,
        );
        home.current = { ...scattered };
        setSpots(scattered);
    }, [items, size]);

    // Follow `active` when the parent changes it: a deep link parks the pin,
    // a back button sends it home.
    useEffect(() => {
        const s = size();
        if (!s || !spots) return;
        const prev = lastActive.current;
        lastActive.current = active;
        if (prev && prev !== active) {
            const back = home.current[prev];
            if (back) {
                pullOut(prev, spots[prev]);
                pushIn(prev, FLIGHT_MS);
                setSpots((p) => p && { ...p, [prev]: back });
            }
            window.setTimeout(() => pinRefs.current[prev]?.focus({ preventScroll: true }), 50);
        }
        if (active && !inZone(spots[active], s)) {
            pullOut(active, spots[active]);
            pushIn(active, FLIGHT_MS);
            home.current[active] = spots[active];
            setSpots((p) => p && { ...p, [active]: zoneSpot(s) });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, spots === null, size]);

    // Keep pins on the board when the window changes size.
    useEffect(() => {
        let last = size();
        const onResize = () => {
            const s = size();
            if (!s || !last) return;
            const was = last;
            const sx = s.w / was.w;
            const sy = s.h / was.h;
            const fit = (p: Spot): Spot => ({
                x: Math.min(Math.max(8, p.x * sx), s.w - s.zone - s.pw - 8),
                y: Math.min(Math.max(8, p.y * sy), s.h - s.ph - 8),
            });
            setHoles((prev) => prev.map((h) => ({ x: h.x * sx, y: h.y * sy })));
            setSpots((prev) => {
                if (!prev) return prev;
                const next: Spots = {};
                for (const id of Object.keys(prev)) {
                    next[id] = inZone(prev[id], was) ? zoneSpot(s) : fit(prev[id]);
                    if (home.current[id]) home.current[id] = fit(home.current[id]);
                }
                return next;
            });
            last = s;
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [size]);

    useEffect(
        () => () => {
            window.clearTimeout(openTimer.current);
            Object.values(pushTimers.current).forEach((t) => window.clearTimeout(t));
        },
        [],
    );

    const onPointerDown = (e: React.PointerEvent, id: string) => {
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
            pullOut(d.id, d.from);
        }
        // While a page is open only the zone strip is on screen, so the pin
        // may only peek out of it.
        const minX = active ? s.w - s.zone - s.pw * 0.75 : 0;
        const x = Math.min(Math.max(minX, d.from.x + dx), s.w - s.pw);
        const y = Math.min(Math.max(0, d.from.y + dy), s.h - s.ph);
        setSpots({ ...spots, [d.id]: { x, y } });
        setHot(inZone({ x, y }, s));
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
        if (!d.moved) {
            // A plain click or tap: send the pin to the zone, or take it back.
            if (active === d.id) onClose();
            else park(d.id, p);
            return;
        }
        if (active) {
            if (inZone(p, s)) {
                setSpots({ ...spots, [d.id]: zoneSpot(s) });
                pushIn(d.id, FLIGHT_MS);
            } else {
                onClose(); // the pin flies home and is pushed in there
            }
        } else if (inZone(p, s)) {
            park(d.id, d.from, true);
        } else {
            pushIn(d.id, 0);
        }
    };

    const cls = ["board"];
    if (className) cls.push(className);
    if (active) cls.push("open");

    return (
        <div className={cls.join(" ")} ref={boardRef}>
            <div className="decor" inert={active ? true : undefined}>
                {children}
            </div>

            {holes.map((h, i) => (
                <span key={i} className="hole" style={{ left: h.x, top: h.y }} aria-hidden />
            ))}

            <div className={hot ? "zone hot" : "zone"} ref={zoneRef} aria-hidden>
                <div className="zone-ring" />
                <div className="zone-label">{zoneLabel}</div>
                <div className="zone-back">{zoneBack}</div>
            </div>

            {items.map((item) => {
                const spot = spots?.[item.id];
                const isOpen = active === item.id;
                const offstage = !!active && !isOpen;
                const c = [pinClass];
                if (item.badge) c.push("badge", `b-${item.badge}`);
                if (dragging === item.id) c.push("dragging");
                if (!spot) c.push("hidden");
                if (phase[item.id]) c.push(phase[item.id]);
                return (
                    <button
                        key={item.id}
                        ref={(el) => {
                            pinRefs.current[item.id] = el;
                        }}
                        className={c.join(" ")}
                        style={
                            {
                                left: spot?.x ?? 0,
                                top: spot?.y ?? 0,
                                "--note": item.note,
                                "--rot": `${isOpen ? 0 : item.rot}deg`,
                            } as React.CSSProperties
                        }
                        tabIndex={offstage ? -1 : 0}
                        aria-hidden={offstage || undefined}
                        aria-label={isOpen ? `Close ${item.title}` : `Open ${item.title}`}
                        onPointerDown={(e) => onPointerDown(e, item.id)}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        onKeyDown={(e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.preventDefault();
                            if (isOpen) onClose();
                            else if (spot) park(item.id, spot);
                        }}
                    >
                        <span className="tack" aria-hidden />
                        <span className="label">
                            {item.title}
                            {item.sub && <small>{item.sub}</small>}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
