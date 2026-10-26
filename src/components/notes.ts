// Long text is pinned up on a random-looking mix of post-its and papers.
// The mix is seeded by a key so server and client render the same markup,
// while each group of notes still gets its own order.

const kinds = ["sticky", "sticky", "index", "sticky", "torn", "sticky", "grid", "kraft"];
const colors = ["#fff27a", "#ff9fc4", "#a6f0b5", "#8fd4ff", "#ffbf6b", "#d7b8ff"];

export type NoteStyle = { className: string; style: React.CSSProperties };

function seeded(key: string) {
    let h = 2166136261;
    for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return () => {
        h = Math.imul(h ^ (h >>> 15), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
}

function shuffle<T>(list: T[], rand: () => number) {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

// n note styles for one group; neighbours never share a paper or a colour.
export function noteStyles(key: string, n: number): NoteStyle[] {
    const rand = seeded(key);
    const k = shuffle(kinds, rand);
    const c = shuffle(colors, rand);
    const out: NoteStyle[] = [];
    let prev = "";
    for (let i = 0, j = 0; i < n; i++, j++) {
        // Skip ahead rather than put the same kind of paper twice in a row.
        for (let tries = 0; k[j % k.length] === prev && tries < k.length; tries++) j++;
        const kind = k[j % k.length];
        prev = kind;
        out.push({
            className: `note-${kind}`,
            style: { "--note": c[i % c.length] } as React.CSSProperties,
        });
    }
    return out;
}
