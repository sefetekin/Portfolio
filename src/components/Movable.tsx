"use client";

import { useRef, useState } from "react";

let topLayer = 1; // the last paper moved stays on top

type Torn = { x: number; y: number; w: number; h: number };

/**
 * A paper, note or photo that can be picked up and put down anywhere on the
 * board, the drop zone included, where it just stays. Once moved it is
 * lifted out of its scrolling column and pinned to the board itself, so a
 * scrolling sheet never clips it. Touch only drags sideways so the page
 * still scrolls vertically.
 */
export default function Movable({
    as: Tag = "div",
    className,
    style,
    children,
    ...rest
}: {
    as?: "div" | "article";
    className: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "style" | "children">) {
    const [torn, setTorn] = useState<Torn | null>(null);
    const [hold, setHold] = useState<{ w: number; h: number } | null>(null);
    const [lifted, setLifted] = useState(false);
    const [layer, setLayer] = useState(0);
    const start = useRef<{
        id: number;
        x: number;
        y: number;
        from: Torn;
        inFlow: boolean;
        moved: boolean;
    } | null>(null);

    const drop = () => {
        if (!start.current) return;
        const moved = start.current.moved;
        start.current = null;
        setLifted(false);
        setHold(null);
        if (moved) setLayer(++topLayer);
    };

    return (
        <>
            {hold && <div className="movable-hold" style={{ width: hold.w, height: hold.h }} aria-hidden />}
            <Tag
                {...rest}
                className={`${className} movable${lifted ? " lifted" : ""}${torn ? " torn" : ""}`}
                style={
                    {
                        ...style,
                        ...(lifted ? { "--rot": "0deg" } : null),
                        ...(torn && {
                            position: "fixed",
                            left: torn.x,
                            top: torn.y,
                            right: "auto",
                            bottom: "auto",
                            width: torn.w,
                            height: torn.h,
                            margin: 0,
                        }),
                        zIndex: lifted ? 50 : layer || undefined,
                    } as React.CSSProperties
                }
                onPointerDown={(e) => {
                    if (e.button !== 0 || (e.target as HTMLElement).closest("a, button, object")) return;
                    const el = e.currentTarget;
                    const track = el.closest(".track");
                    if (!track) return;
                    // The board slides on a transformed track, which fixed
                    // positions are measured from.
                    const r = el.getBoundingClientRect();
                    const t = track.getBoundingClientRect();
                    const w = el.offsetWidth;
                    const h = el.offsetHeight;
                    const from = torn ?? {
                        x: r.left + r.width / 2 - w / 2 - t.left,
                        y: r.top + r.height / 2 - h / 2 - t.top,
                        w,
                        h,
                    };
                    const pos = getComputedStyle(el).position;
                    el.setPointerCapture(e.pointerId);
                    start.current = {
                        id: e.pointerId,
                        x: e.clientX,
                        y: e.clientY,
                        from,
                        inFlow: !torn && pos !== "absolute" && pos !== "fixed",
                        moved: false,
                    };
                }}
                onPointerMove={(e) => {
                    const s = start.current;
                    if (!s || s.id !== e.pointerId) return;
                    const dx = e.clientX - s.x;
                    const dy = e.clientY - s.y;
                    if (!s.moved) {
                        if (Math.hypot(dx, dy) < 4) return;
                        s.moved = true;
                        setLifted(true);
                        // Keep its old spot open while it is in the air.
                        if (s.inFlow) setHold({ w: s.from.w, h: s.from.h });
                    }
                    setTorn({ ...s.from, x: s.from.x + dx, y: s.from.y + dy });
                }}
                onPointerUp={drop}
                onPointerCancel={drop}
            >
                {children}
            </Tag>
        </>
    );
}
