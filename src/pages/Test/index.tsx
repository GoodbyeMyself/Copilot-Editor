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

## Diff 代码块示例

下面是一个 Git diff 示例，展示了文件的修改：

\`\`\`diff
diff --git a/src/utils/helper.js b/src/utils/helper.js
index 1234567..abcdefg 100644
--- a/src/utils/helper.js
+++ b/src/utils/helper.js
@@ -1,10 +1,12 @@
 function calculateTotal(items) {
-    let total = 0;
-    for (let i = 0; i < items.length; i++) {
-        total += items[i].price;
-    }
-    return total;
+    return items.reduce((sum, item) => {
+        // 添加折扣计算
+        const discountedPrice = item.price * (1 - (item.discount || 0));
+        return sum + discountedPrice;
+    }, 0);
 }
 
+// 新增：格式化价格显示
+const formatPrice = (price) => \`¥\${price.toFixed(2)}\`;
+
 export { calculateTotal };
\`\`\`

这个 diff 显示了：
- **红色行**：被删除的代码
- **绿色行**：新添加的代码  
- **蓝色行**：上下文信息和文件头部
`;

const TestPage: React.FC = () => {
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

export default TestPage;
