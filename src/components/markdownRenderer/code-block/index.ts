// --
import 'highlight.js/styles/monokai.css';
import './styles.less';

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
import diff from 'highlight.js/lib/languages/diff';

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
    hljs.registerLanguage('diff', diff);
    hljs.configure({ ignoreUnescapedHTML: true });

    isRegistered = true;
}

// 用于跟踪已经高亮过的代码块
const highlightedNodes = new WeakSet<HTMLElement>();

// 获取代码块语言
function getLanguageFromElement(codeElement: HTMLElement): string {
    // 从class中检测语言，格式通常为 language-xxx 或 hljs-xxx
    const classList = Array.from(codeElement.classList);

    // 优先检查 language- 前缀
    for (const className of classList) {
        if (className.startsWith('language-')) {
            return className.replace('language-', '');
        }
    }

    // 检查父元素的class
    const preElement = codeElement.closest('pre');

    if (preElement) {
        const preClassList = Array.from(preElement.classList);
        for (const className of preClassList) {
            if (className.startsWith('language-')) {
                return className.replace('language-', '');
            }
        }
    }

    // 检查hljs检测到的语言
    for (const className of classList) {
        if (className.startsWith('hljs-') && className !== 'hljs') {
            return className.replace('hljs-', '');
        }
    }

    // 从hljs结果中获取语言
    if (codeElement.classList.contains('hljs')) {
        const detectedLanguage = (codeElement as any).result?.language;
        if (detectedLanguage) {
            return detectedLanguage;
        }
    }

    return 'text'; // 默认语言
}

// 创建代码块头部
function createCodeBlockHeader(language: string, codeContent: string): HTMLElement {
    const header = document.createElement('div');
    header.className = 'code-block-header';

    // 左侧容器：语言标识
    const leftSection = document.createElement('div');
    leftSection.className = 'code-block-header-left';

    const languageLabel = document.createElement('span');
    languageLabel.className = 'code-block-language';
    
    // 为 diff 语言提供特殊显示
    let displayLanguage = language !== 'undefined' ? language.toUpperCase() : 'TEXT';
    if (language === 'diff') {
        displayLanguage = 'DIFF';
    }
    
    languageLabel.textContent = displayLanguage;
    leftSection.appendChild(languageLabel);

    // 右侧容器：按钮组
    const rightSection = document.createElement('div');
    rightSection.className = 'code-block-header-right';

    // 折叠/展开按钮
    const collapseButton = document.createElement('button');
    collapseButton.className = 'code-block-collapse-btn';
    collapseButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
        <span>收起</span>
    `;

    // 复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'code-block-copy-btn';
    copyButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>复制</span>
    `;

    // 折叠/展开功能
    collapseButton.addEventListener('click', () => {
        const container = header.closest('.code-block-container') as HTMLElement;
        const preElement = container?.querySelector('pre') as HTMLElement;
        
        if (!container || !preElement) return;

        const isCollapsed = container.classList.contains('collapsed');
        
        if (isCollapsed) {
            // 展开
            container.classList.remove('collapsed');
            collapseButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
                <span>收起</span>
            `;
        } else {
            // 收起
            container.classList.add('collapsed');
            collapseButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
                <span>展开</span>
            `;
        }
    });

    // 复制功能
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(codeContent);

            // 临时显示复制成功状态
            const originalHTML = copyButton.innerHTML;
            copyButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
                <span>已复制</span>
            `;
            copyButton.classList.add('copied');

            setTimeout(() => {
                copyButton.innerHTML = originalHTML;
                copyButton.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
            // 降级到旧的复制方法
            const textArea = document.createElement('textarea');
            textArea.value = codeContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    });

    // 组装按钮到右侧容器
    rightSection.appendChild(copyButton);
    rightSection.appendChild(collapseButton);

    // 组装头部
    header.appendChild(leftSection);
    header.appendChild(rightSection);

    return header;
}

// 为代码块添加头部容器
function wrapCodeBlockWithHeader(preElement: HTMLElement, codeElement: HTMLElement): void {
    // 检查是否已经有容器
    if (preElement.parentElement?.classList.contains('code-block-container')) {
        return;
    }

    const language = getLanguageFromElement(codeElement);
    const codeContent = codeElement.textContent || '';

    // 创建容器
    const container = document.createElement('div');
    container.className = 'code-block-container';
    
    // 为 diff 代码块添加特殊标识
    if (language === 'diff') {
        container.setAttribute('data-language', 'diff');
    }

    // 创建头部
    const header = createCodeBlockHeader(language, codeContent);

    // 包装原有的pre元素
    preElement.parentNode?.insertBefore(container, preElement);
    container.appendChild(header);
    container.appendChild(preElement);
}

export function buildCodeBlock(element: HTMLElement | null | undefined, forceRefresh = false): void {
    if (!element) return;

    // --
    ensureRegisterLanguages();

    // --
    const nodes = element.querySelectorAll('pre code');

    // --
    nodes.forEach((node) => {
        const codeElement = node as HTMLElement;
        const preElement = codeElement.closest('pre') as HTMLElement;

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

            // 添加header容器
            if (preElement) {
                wrapCodeBlockWithHeader(preElement, codeElement);
            }

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
        const preElement = codeElement.closest('pre') as HTMLElement;

        // 跳过已经处理过的节点
        if (highlightedNodes.has(codeElement)) {
            return;
        }

        try {
            hljs.highlightElement(codeElement);

            // 添加header容器
            if (preElement) {
                wrapCodeBlockWithHeader(preElement, codeElement);
            }

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

