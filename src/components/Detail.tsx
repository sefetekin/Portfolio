"use client";

import { useRef, useState } from "react";
import type { Detail } from "./Papers";

const colors = ["#fff3a8", "#ffd6c9", "#cdeccd", "#cfe3ff", "#f1d9ff", "#ffe2a8"];
const tilt = (i: number) => ((i * 47) % 7) - 3;
let topLayer = 1; // the last pin moved stays on top

// A pin that sits in the flow of the page but can be dragged off its spot.
// Touch only drags sideways so the page still scrolls vertically.
function Loose({
    i,
    className,
    style,
    children,
}: {
    i: number;
    className: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [lifted, setLifted] = useState(false);
    const [layer, setLayer] = useState(0);
    const start = useRef<{ id: number; x: number; y: number; ox: number; oy: number } | null>(
        null,
    );

    return (
        <div
            className={lifted ? `${className} lifted` : className}
            style={
                {
                    ...style,
                    "--rot": `${lifted ? 0 : tilt(i)}deg`,
                    translate: `${offset.x}px ${offset.y}px`,
                    zIndex: lifted ? 50 : layer,
                } as React.CSSProperties
            }
            onPointerDown={(e) => {
                if (e.button !== 0 || (e.target as HTMLElement).closest("a")) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                start.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
                setLifted(true);
            }}
            onPointerMove={(e) => {
                const s = start.current;
                if (!s || s.id !== e.pointerId) return;
                setOffset({ x: s.ox + e.clientX - s.x, y: s.oy + e.clientY - s.y });
            }}
            onPointerUp={() => {
                start.current = null;
                setLifted(false);
                setLayer(++topLayer);
            }}
            onPointerCancel={() => {
                start.current = null;
                setLifted(false);
            }}
        >
            <span className="tack" aria-hidden />
            {children}
        </div>
    );
}

export default function DetailPins({ detail }: { detail: Detail }) {
    const images = detail.images.length ? detail.images : [null, null];
    let i = 0;
    return (
        <div className="loose-pins">
            {detail.points.map((p) => (
                <Loose
                    key={p.text}
                    i={i++}
                    className="loose note"
                    style={{ "--note": colors[i % colors.length] } as React.CSSProperties}
                >
                    <p>{p.text}</p>
                    {p.meta && <p className="meta">{p.meta}</p>}
                </Loose>
            ))}
            {images.map((src, n) => (
                <Loose key={src ?? `placeholder-${n}`} i={i++} className="loose photo">
                    {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" draggable={false} />
                    ) : (
                        <div className="photo-placeholder" aria-label="Image placeholder">
                            <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden>
                                <path
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    d="M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5a1.5 1.5 0 1 0 0-.01"
                                />
                            </svg>
                        </div>
                    )}
                    <span className="caption">{src ? detail.title : "photo coming soon"}</span>
                </Loose>
            ))}
            {detail.tags.length > 0 && (
                <Loose i={i++} className="loose note tags" style={{ "--note": "#ffffff" } as React.CSSProperties}>
                    <p className="meta">Tools</p>
                    <div className="chips">
                        {detail.tags.map((t) => (
                            <span key={t} className="chip">
                                {t}
                            </span>
                        ))}
                    </div>
                </Loose>
            )}
        </div>
    );
}
