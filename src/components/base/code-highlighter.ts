import type { HighlighterCore } from "shiki/core";
import { createHighlighterCore } from "shiki/core";
import getWasm from "shiki/wasm";

let shiki: HighlighterCore | undefined;

export const getHighlighter = async () => {
    if (shiki) return shiki;

    shiki = await createHighlighterCore({
        langs: [
            import("shiki/langs/sql.mjs"),
            import("shiki/langs/json.mjs"),
            import("shiki/langs/python.mjs"),
        ],
        loadWasm: getWasm,
        themes: [
            import("shiki/themes/github-light.mjs"),
            import("shiki/themes/aurora-x.mjs"),
            import("shiki/themes/vitesse-dark.mjs"),
            import("shiki/themes/vitesse-light.mjs"),
            import("shiki/themes/monokai.mjs"),
        ],
    });

    return shiki;
};
