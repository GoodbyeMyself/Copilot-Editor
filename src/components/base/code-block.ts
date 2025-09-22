// --
import 'highlight.js/styles/monokai.css';

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

// 用于跟踪已经高亮过的代码块
const highlightedNodes = new WeakSet<HTMLElement>();

export function buildCodeBlock(element: HTMLElement | null | undefined, forceRefresh = false): void {
    if (!element) return;

    // --
    ensureRegisterLanguages();

    // --
    const nodes = element.querySelectorAll('pre code');

    // --
    nodes.forEach((node) => {
        const codeElement = node as HTMLElement;
        
        // 如果不是强制刷新，并且已经高亮过，则跳过
        if (!forceRefresh && highlightedNodes.has(codeElement)) {
            return;
        }

        try {
            // 清除之前的高亮类名，避免重复应用
            if (highlightedNodes.has(codeElement)) {
                codeElement.className = codeElement.className.replace(/hljs[\w-]*/g, '').trim();
            }
            
            hljs.highlightElement(codeElement);
            highlightedNodes.add(codeElement);
        } catch {
            // noop
        }
    });
}

// 新增：用于增量处理新添加的代码块
export function buildCodeBlockIncremental(element: HTMLElement | null | undefined): void {
    if (!element) return;

    ensureRegisterLanguages();

    // 只处理没有被高亮过的代码块，使用更精确的选择器
    const nodes = element.querySelectorAll('pre code:not(.hljs):not([data-highlighted])');
    
    nodes.forEach((node) => {
        const codeElement = node as HTMLElement;
        
        // 跳过已经处理过的节点
        if (highlightedNodes.has(codeElement)) {
            return;
        }

        try {
            hljs.highlightElement(codeElement);
            highlightedNodes.add(codeElement);
            // 添加标记避免重复处理
            codeElement.setAttribute('data-highlighted', 'true');
        } catch {
            // noop
        }
    });
}

// 新增：清理已删除节点的引用
export function cleanupCodeBlockReferences(element: HTMLElement | null | undefined): void {
    if (!element) return;
    
    // 从WeakSet中无法直接删除，但可以通过检查DOM中是否还存在来判断
    // WeakSet会在节点被垃圾回收时自动清理
    // 这里我们主要是为了清理可能的内存泄漏
}

// end

