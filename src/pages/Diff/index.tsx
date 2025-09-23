
import React, { useState } from "react";
import { DiffEditor } from "@monaco-editor/react";
import styles from "./styles.module.less";


const DiffPage: React.FC = () => {
    const [renderSideBySide, setRenderSideBySide] = useState(true);
    const [editorWidth, setEditorWidth] = useState('100vh');
    
    const originalCode = `function calculateSum(a, b) {
    return a + b;
}

const result = calculateSum(5, 10);
console.log("Result:", result);`;

    const modifiedCode = `function calculateSum(a, b, c = 0) {
    // 添加了第三个参数，默认值为0
    return a + b + c;
}

const result = calculateSum(5, 10, 3);
console.log("计算结果:", result);
console.log("新增功能测试");`;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Monaco DiffEditor 配置演示</h2>
            
            {/* 控制面板 */}
            <div className={styles.controlPanel}>
                <h3>配置选项:</h3>
                <div className={styles.configOption}>
                    <label>
                        <input
                            type="checkbox"
                            checked={renderSideBySide}
                            onChange={(e) => setRenderSideBySide(e.target.checked)}
                            style={{marginRight: '10px'}}
                        />
                        {' '} 并排显示模式 (renderSideBySide)
                    </label>
                    <p className={styles.helpText}>
                        勾选: 固定并排显示 | 不勾选: 内联显示模式
                    </p>
                </div>
                
                <div className={styles.configOption}>
                    <label>
                        编辑器宽度: 
                        <select 
                            value={editorWidth} 
                            onChange={(e) => setEditorWidth(e.target.value)}
                            className={styles.widthSelector}
                        >
                            <option value="50vh">50vh (窄)</option>
                            <option value="80vh">80vh (中等)</option>
                            <option value="100vh">100vh (宽)</option>
                            <option value="100%">100% (全宽)</option>
                        </select>
                    </label>
                </div>
            </div>

            {/* DiffEditor */}
            <DiffEditor
                width={editorWidth}
                height='40vh'
                language='javascript'
                original={originalCode}
                modified={modifiedCode}
                options={{
                    // 核心配置：固定diff显示模式
                    renderSideBySide: renderSideBySide,
                    
                    // 其他有用的配置选项
                    enableSplitViewResizing: true,  // 允许调整左右面板大小
                    readOnly: false,               // 是否只读
                    automaticLayout: true,         // 自动调整布局
                    diffCodeLens: true,           // 显示diff代码透镜
                    diffAlgorithm: 'advanced',    // 使用高级diff算法
                    
                    // 编辑器通用选项
                    fontSize: 14,
                    lineNumbers: 'on',
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',               // 自动换行
                }}
            />
            
            <div className={styles.infoPanel}>
                <h4>说明:</h4>
                <ul>
                    <li><strong>renderSideBySide: true</strong> - 固定使用并排显示，不受宽度影响</li>
                    <li><strong>renderSideBySide: false</strong> - 固定使用内联显示，所有差异显示在一个面板中</li>
                    <li><strong>enableSplitViewResizing: true</strong> - 在并排模式下允许拖拽调整左右面板宽度</li>
                    <li><strong>automaticLayout: true</strong> - 容器大小改变时自动调整编辑器布局</li>
                </ul>
            </div>
        </div>
    );
};

export default DiffPage;
