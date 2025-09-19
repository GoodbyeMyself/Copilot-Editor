import DOMPurify from "dompurify";

import { Suspense, useState, useEffect } from "react";

import { type CodeToHastOptionsCommon, type HighlighterCore } from "shiki/core";

import { getHighlighter } from "@/components/base/code-highlighter";

let shiki: HighlighterCore | undefined;

type CreateHighlighterProps = {
    text: string;
    lang: CodeToHastOptionsCommon["lang"];
};

const createHighlighter = async (
    props: CreateHighlighterProps & { isDark: boolean },
) => {
    try {
        if (!shiki) shiki = await getHighlighter();

        let html = shiki.codeToHtml(props.text, {
            lang: props.lang,
            theme: props.isDark ? "monokai" : "github-light",
        });
        if (!html) throw new Error("Failed to create highlighter");

        // 为 <pre> / <code> 补充 language-xxx class，便于样式和选择器使用
        const language = String(props.lang || "txt");
        const languageClass = `language-${language}`;

        const ensureLanguageClass = (input: string): string => {
            let output = input;
            // <pre> 已有 class 的情况，追加 language-xxx
            output = output.replace(
                /<pre([^>]*)class="([^"]*)"/,
                (m, attrs, classes) => `<pre${attrs} class="${
                    classes.includes(languageClass) ? classes : `${classes} ${languageClass}`
                }"`
            );
            // <pre> 没有 class 的情况
            output = output.replace(
                /<pre(?![^>]*class=)([^>]*)>/,
                `<pre class="${languageClass}"$1>`
            );

            // <code> 已有 class 的情况，追加 language-xxx
            output = output.replace(
                /<code([^>]*)class="([^"]*)"/,
                (m, attrs, classes) => `<code${attrs} class="${
                    classes.includes(languageClass) ? classes : `${classes} ${languageClass}`
                }"`
            );
            // <code> 没有 class 的情况
            output = output.replace(
                /<code(?![^>]*class=)([^>]*)>/,
                `<code class="${languageClass}"$1>`
            );

            return output;
        };

        html = ensureLanguageClass(html);

        return DOMPurify.sanitize(html);
    } catch (e) {
        console.error("Failed to create highlighter: ", e);
        return "";
    }
};

function HighlightContent(
    props: CreateHighlighterProps & { isDark: boolean },
): JSX.Element {
    const [html, setHtml] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isCancelled = false;
        
        const loadHighlighter = async () => {
            setIsLoading(true);
            try {
                const result = await createHighlighter(props);
                if (!isCancelled) {
                    setHtml(result);
                }
            } catch (error) {
                console.error("Failed to create highlighter: ", error);
                if (!isCancelled) {
                    setHtml("");
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadHighlighter();

        return () => {
            isCancelled = true;
        };
    }, [props.text, props.lang, props.isDark]);

    if (isLoading) {
        return (
            <div className="overflow-x-auto font-mono text-sm p-4">
                <div className="animate-pulse">加载中...</div>
            </div>
        );
    }

    return (
        <div
            // wrapping is applied in global styles (otherwise it doesn't work)
            className="overflow-x-auto font-mono text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default function Highlighter(props: CreateHighlighterProps) {
    // 主题 默认浅色
    const isDark = true;

    return (
        <Suspense>
            <HighlightContent
                {...props}
                isDark={isDark}
            />
        </Suspense>
    );
}
