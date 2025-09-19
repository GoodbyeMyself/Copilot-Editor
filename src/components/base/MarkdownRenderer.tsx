import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Highlighter from '@/components/base/lazy-shiki';

interface MarkdownRendererProps {
    children: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => {
    return (
        <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
                code(props) {
                    const { className, children, ...rest } = props as any;
                    const isInline: boolean = (props as any).inline === true;

                    if (isInline) {
                        return (
                            <code className={className} {...rest}>
                                {children}
                            </code>
                        );
                    }

                    // 对于块级代码，交由 pre 渲染器处理，这里返回 null
                    return null as any;
                },
                pre({ children }) {
                    // children 通常形如 <code className="language-xxx">...</code>
                    const codeElement: any = Array.isArray(children) ? children[0] : children as any;
                    const className: string = codeElement?.props?.className || '';
                    const langMatch = /language-([\w-]+)/.exec(className);
                    const lang = (langMatch?.[1] || 'txt') as any;
                    const text = String(codeElement?.props?.children ?? '').replace(/\n$/, '');

                    return (
                        <Highlighter
                            text={text}
                            lang={lang}
                        />
                    );
                },
            }}
        >
            {children}
        </Markdown>
    );
};

export default MarkdownRenderer;