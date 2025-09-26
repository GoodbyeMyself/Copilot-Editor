import React, { useEffect, useMemo, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import emoji from 'markdown-it-emoji';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
import footnote from 'markdown-it-footnote';
import ins from 'markdown-it-ins';
import mark from 'markdown-it-mark';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import taskLists from 'markdown-it-task-lists';
import container from 'markdown-it-container';
import toc from 'markdown-it-toc-done-right';

// --
import DOMPurify from 'dompurify';

// --
import { buildCodeBlock, buildCodeBlockIncremental } from './code-block/index';

interface MarkdownRendererProps {
    children: string;
    isStreaming?: boolean; // 是否为流式输出模式
    enableIncremental?: boolean; // 是否启用增量更新
}

// 复用同一套解析配置，避免频繁创建实例
const createMarkdownIt = () => {
    const md = new MarkdownIt({
        html: true,
        xhtmlOut: true,
        breaks: true,
        linkify: false,
        typographer: true,
        quotes: '“”‘’',
    });

    md.use(emoji)
    .use(deflist)
    .use(abbr)
    .use(footnote)
    .use(ins)
    .use(mark)
    .use(sub)
    .use(sup)
    .use(taskLists)
    .use(container)
    .use(container, 'hljs-left')
    .use(container, 'hljs-center')
    .use(container, 'hljs-right')
    .use(toc);

    // 自定义渐进式解析
    md.use((md) => {
        // --
        console.log(md, '<- 打印 innerMd');
    });

    return md;
};

const singletonMd = createMarkdownIt();

// 智能DOM更新 - 保持已渲染的节点不变
const updateDOMSmart = (container: HTMLElement, newHTML: string, oldHTML: string) => {
    // 如果内容完全相同，直接返回
    if (newHTML === oldHTML) return;
    
    // 创建新的临时容器
    const newContainer = document.createElement('div');
    newContainer.innerHTML = newHTML;
    
    const oldContainer = document.createElement('div');
    oldContainer.innerHTML = oldHTML;
    
    // 获取所有子节点
    const newNodes = Array.from(newContainer.children);
    const oldNodes = Array.from(oldContainer.children);
    const existingNodes = Array.from(container.children);
    
    // 找到第一个不同的节点索引
    let diffIndex = 0;
    for (let i = 0; i < Math.min(oldNodes.length, newNodes.length); i++) {
        const oldNode = oldNodes[i];
        const newNode = newNodes[i];
        
        // 比较节点的关键属性
        if (oldNode.tagName !== newNode.tagName || 
            oldNode.className !== newNode.className ||
            oldNode.outerHTML !== newNode.outerHTML) {
            diffIndex = i;
            break;
        }
        diffIndex = i + 1;
    }
    
    // 保持相同的节点不变，只更新不同的部分
    // 移除多余的旧节点
    while (container.children.length > diffIndex) {
        container.removeChild(container.lastElementChild!);
    }
    
    // 添加或替换不同的节点
    for (let i = diffIndex; i < newNodes.length; i++) {
        const newNode = newNodes[i].cloneNode(true) as HTMLElement;
        
        if (i < existingNodes.length) {
            // 替换现有节点
            container.replaceChild(newNode, existingNodes[i]);
        } else {
            // 添加新节点
            container.appendChild(newNode);
        }
    }
};

// 渲染后对代码块和自定义标签进行处理
const PostProcessWrapper: React.FC<MarkdownRendererProps> = ({ 
    children, 
    isStreaming = false, 
    enableIncremental = false 
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const previousContentRef = useRef<string>('');
    const previousHTMLRef = useRef<string>('');
    const isInitialRender = useRef<boolean>(true);

    const html = useMemo(() => {
        const rendered = singletonMd.render(children || '');
        return DOMPurify.sanitize(rendered);
    }, [children]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // 判断是否为增量内容
        const isIncremental = enableIncremental && 
                             !isInitialRender.current && 
                             children.startsWith(previousContentRef.current) &&
                             children.length > previousContentRef.current.length;

        if (isStreaming && isIncremental && previousHTMLRef.current) {
            try {
                // 使用智能DOM更新，保持相同的节点不变
                updateDOMSmart(el, html, previousHTMLRef.current);
                // 只对新增的代码块进行高亮
                buildCodeBlockIncremental(el);
            } catch (error) {
                console.warn('Smart DOM update failed, falling back to full render:', error);
                // 降级到完整渲染
                el.innerHTML = html;
                buildCodeBlock(el, true);
            }
        } else {
            // 完整更新DOM
            el.innerHTML = html;
            buildCodeBlock(el, !isInitialRender.current);
        }

        // 更新引用
        previousContentRef.current = children;
        previousHTMLRef.current = html;
        isInitialRender.current = false;
    }, [html, children, isStreaming, enableIncremental]);

    return (
        <div
            className="markdown-body"
            ref={ref}
        />
    );
};

// 专门用于SSE流式渲染的组件
const StreamingMarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children, ...props }) => {
    return (
        <PostProcessWrapper 
            {...props}
            isStreaming={true}
            enableIncremental={true}
        >
            {children}
        </PostProcessWrapper>
    );
};

// 导出不同的渲染器
export { StreamingMarkdownRenderer };

// 默认导出使用后处理包装，保持原 API
export default PostProcessWrapper;
