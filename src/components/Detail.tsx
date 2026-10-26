"use client";

import Movable from "./Movable";
import { noteStyles } from "./notes";
import type { Detail } from "./Papers";

const tilt = (i: number) => ((i * 47) % 7) - 3;

// A pin that sits in the flow of the page until it is picked up.
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
    return (
        <Movable className={className} style={{ ...style, "--rot": `${tilt(i)}deg` } as React.CSSProperties}>
            <span className="tack" aria-hidden />
            {children}
        </Movable>
    );
}

export default function DetailPins({ detail }: { detail: Detail }) {
    const images = detail.images.length
        ? detail.images
        : Array.from({ length: detail.photoSlots ?? 2 }, () => null);
    const notes = noteStyles(detail.title, detail.points.length + 1);
    let i = 0;
    return (
        <div className="loose-pins">
            {detail.points.map((p, n) => (
                <Loose
                    key={p.text}
                    i={i++}
                    className={`loose note ${notes[n].className}`}
                    style={notes[n].style}
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
                <Loose
                    i={i++}
                    className={`loose note tags ${notes[detail.points.length].className}`}
                    style={notes[detail.points.length].style}
                >
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
