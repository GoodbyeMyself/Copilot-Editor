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
import { buildCodeBlock } from './code-block';

interface MarkdownRendererProps {
    children: string;
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
    md.use((innerMd) => {
        // --
        const originalParse = innerMd.parse;
        // --
        console.log(originalParse, '<- 自定义渐进式解析');
    });

    return md;
};

const singletonMd = createMarkdownIt();

// 渲染后对代码块和自定义标签进行处理
const PostProcessWrapper: React.FC<MarkdownRendererProps> = ({ children }) => {
    const ref = useRef<HTMLDivElement>(null);
    const html = useMemo(() => {
        const rendered = singletonMd.render(children || '');
        return DOMPurify.sanitize(rendered);
    }, [children]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        buildCodeBlock(el);
    }, [html]);

    return (
        <div
            className="markdown-body"
            ref={ref}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};

// 默认导出使用后处理包装，保持原 API
export default PostProcessWrapper;
