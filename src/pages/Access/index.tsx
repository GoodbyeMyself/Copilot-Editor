import { Access, useAccess } from '@umijs/max';

import { Button } from 'antd';

import MarkdownRenderer from '@/components/markdownRenderer';

const demoMarkdown = `
# Hello World

[百度](https://www.baidu.com)

\`\`\`python
import json


def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("SQL Copilot"))
\`\`\`
`;

const AccessPage: React.FC = () => {
    const access = useAccess();
    return (
        <div style={{ padding: 24 }}>
            <div style={{ backgroundColor: 'white', padding: 24, marginBottom: 24, borderRadius: 8, height: '100px' }}>
                <Access accessible={access.canSeeAdmin}>
                    <Button>只有 Admin 可以看到这个按钮</Button>
                </Access>
            </div>
            <MarkdownRenderer>
                {demoMarkdown}
            </MarkdownRenderer>
        </div>
    );
};

export default AccessPage;
