"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { personalInfo } from "@/data/portfolio";
import DragBoard, { type BoardItem } from "./DragBoard";
import DetailPins from "./Detail";
import {
    SectionPapers,
    boardItems,
    contactLinks,
    detailFor,
    isBoardSection,
    sections,
    type SectionId,
} from "./Papers";

// Angles are fixed per pin so server and client render the same markup.
const angles: Record<SectionId, number> = {
    about: -6,
    experience: 4,
    research: -4,
    projects: -3,
    skills: 7,
    cv: -8,
    contact: 3,
};

// Every pin is a different souvenir badge, as if collected on travels.
const badges: Record<SectionId, string> = {
    about: "roundel",
    experience: "enamel",
    research: "button",
    projects: "paris",
    skills: "nazar",
    cv: "plaque",
    contact: "patch",
};

const mainItems: BoardItem[] = sections.map((s) => ({
    id: s.id,
    title: s.title,
    note: s.note,
    rot: angles[s.id],
    badge: badges[s.id],
}));

const isSection = (v: string): v is SectionId => sections.some((s) => s.id === v);

const boardHint: Record<string, string> = {
    experience: "drop a role on the right →",
    research: "drop a project on the right →",
    contact: "drop a badge on the right to open it →",
};

export default function PinBoard() {
    // What is open at each level of the board, and what each panel shows.
    // The shown values linger while a panel slides away.
    const [section, setSection] = useState<SectionId | null>(null);
    const [item, setItem] = useState<string | null>(null);
    const [shown, setShown] = useState<SectionId>("about");
    const [shownItem, setShownItem] = useState<string | null>(null);
    const [link, setLink] = useState<string | null>(null); // contact badge in the zone
    const sectionHeading = useRef<HTMLHeadingElement>(null);
    const itemHeading = useRef<HTMLHeadingElement>(null);

    const depth = section ? (item ? 2 : 1) : 0;

    useEffect(() => {
        const [s, i] = location.hash.slice(1).split("/");
        if (!isSection(s)) return;
        setSection(s);
        setShown(s);
        if (isBoardSection(s) && i && detailFor(s, i)) {
            setItem(i);
            setShownItem(i);
        }
    }, []);

    useEffect(() => {
        const hash = section ? `#${section}${item ? `/${item}` : ""}` : "";
        history.replaceState(null, "", hash || location.pathname + location.search);
    }, [section, item]);

    useEffect(() => {
        if (depth === 1) sectionHeading.current?.focus({ preventScroll: true });
        if (depth === 2) itemHeading.current?.focus({ preventScroll: true });
    }, [depth]);

    const openSection = useCallback((id: string) => {
        if (!isSection(id)) return;
        setSection(id);
        setShown(id);
        setItem(null);
    }, []);
    const closeSection = useCallback(() => {
        setSection(null);
        setItem(null);
    }, []);
    const openItem = useCallback((id: string) => {
        setItem(id);
        setShownItem(id);
    }, []);
    const closeItem = useCallback(() => setItem(null), []);

    // A contact badge opens its link, then goes back to its spot.
    const linkTimer = useRef<number | undefined>(undefined);
    const openLink = useCallback((id: string) => {
        const href = contactLinks[id];
        if (!href) return;
        setLink(id);
        if (href.startsWith("mailto:")) location.href = href;
        else window.open(href, "_blank", "noopener,noreferrer");
        window.clearTimeout(linkTimer.current);
        linkTimer.current = window.setTimeout(() => setLink(null), 1200);
    }, []);
    const closeLink = useCallback(() => {
        window.clearTimeout(linkTimer.current);
        setLink(null);
    }, []);
    useEffect(() => () => window.clearTimeout(linkTimer.current), []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            if (item) closeItem();
            else closeSection();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [item, closeItem, closeSection]);

    const current = sections.find((s) => s.id === shown)!;
    const detail = isBoardSection(shown) && shownItem ? detailFor(shown, shownItem) : null;

    return (
        <main className="viewport">
            <div
                className="track cork"
                style={{ transform: `translateX(calc(${-depth} * (100vw - var(--zone))))` }}
            >
                <DragBoard
                    items={mainItems}
                    active={section}
                    onOpen={openSection}
                    onClose={closeSection}
                    className="level-0"
                    zoneLabel="pin here to read"
                    zoneBack="pull the pin out to go back"
                >
                    <header className="nameplate" data-keepout>
                        <span className="tape" aria-hidden />
                        <h1>{personalInfo.name}</h1>
                        <p>{personalInfo.tagline}</p>
                    </header>
                    <p className="hint" data-keepout>
                        grab a pin, drop it on the right →
                    </p>
                </DragBoard>

                {isBoardSection(shown) ? (
                    <section
                        className="level level-1"
                        aria-labelledby="section-title"
                        inert={depth === 0 ? true : undefined}
                    >
                        <DragBoard
                            key={shown}
                            items={boardItems[shown]}
                            active={shown === "contact" ? link : item}
                            onOpen={shown === "contact" ? openLink : openItem}
                            onClose={shown === "contact" ? closeLink : closeItem}
                            className="sub"
                            pinClass={shown === "contact" ? "pin" : "pin wide"}
                            zoneLabel={shown === "contact" ? "pin here to open" : "pin here to focus"}
                            zoneBack="pull it out to go back"
                        >
                            <div className="panel-head floating" data-keepout>
                                <h2 id="section-title" ref={sectionHeading} tabIndex={-1}>
                                    {current.title}
                                </h2>
                                <button className="back" onClick={closeSection}>
                                    ← back to the board
                                </button>
                            </div>
                            {shown === "contact" && (
                                <div
                                    className="paper note note-sticky contact-note"
                                    style={{ "--note": "#ffbf6b", "--rot": "-3deg" } as React.CSSProperties}
                                    data-keepout
                                >
                                    <span className="tack" aria-hidden />
                                    <h3>Say hello</h3>
                                    <p>
                                        <a href={contactLinks.email}>{personalInfo.email}</a>
                                    </p>
                                    <p className="meta">{personalInfo.location}</p>
                                </div>
                            )}
                            <p className="hint" data-keepout>
                                {boardHint[shown]}
                            </p>
                        </DragBoard>
                    </section>
                ) : (
                    <section
                        className="level panel"
                        aria-labelledby="section-title"
                        inert={depth === 1 ? undefined : true}
                    >
                        <div className="panel-head">
                            <h2 id="section-title" ref={sectionHeading} tabIndex={-1}>
                                {current.title}
                            </h2>
                            <button className="back" onClick={closeSection}>
                                ← back to the board
                            </button>
                        </div>
                        <div className={shown === "cv" ? "papers single" : "papers"}>
                            <SectionPapers id={shown} />
                        </div>
                    </section>
                )}

                <section
                    className="level panel level-2"
                    aria-labelledby="item-title"
                    inert={depth === 2 ? undefined : true}
                >
                    {detail && (
                        <>
                            <div className="panel-head">
                                <div>
                                    <h2 id="item-title" ref={itemHeading} tabIndex={-1}>
                                        {detail.title}
                                    </h2>
                                    <p className="head-meta">{detail.meta}</p>
                                </div>
                                <button className="back" onClick={closeItem}>
                                    ← back to {current.title}
                                </button>
                            </div>
                            <DetailPins key={shownItem} detail={detail} />
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
