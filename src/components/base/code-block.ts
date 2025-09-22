// --
import '@/assets/styles/highlight.less';
import 'highlight.js/styles/atom-one-dark.css';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import markdown from 'highlight.js/lib/languages/markdown';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';

// Register common languages once
let isRegistered = false;
function ensureRegisterLanguages() {
    if (isRegistered) return;
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('python', python);
    hljs.registerLanguage('sql', sql);
    hljs.registerLanguage('json', json);
    hljs.registerLanguage('bash', bash);
    hljs.registerLanguage('shell', shell);
    hljs.registerLanguage('markdown', markdown);
    hljs.registerLanguage('xml', xml);
    hljs.registerLanguage('html', xml);
    hljs.registerLanguage('css', css);
    hljs.configure({ ignoreUnescapedHTML: true });
    isRegistered = true;
}

export function buildCodeBlock(element: HTMLElement | null | undefined): void {
    if (!element) return;
    ensureRegisterLanguages();
    const nodes = element.querySelectorAll('pre code');
    nodes.forEach((node) => {
        try {
            hljs.highlightElement(node as HTMLElement);
        } catch {
            // noop
        }
    });
}

// end

