
import React, { useState, useEffect } from "react";
import { DiffEditor } from "@monaco-editor/react";
import styles from "./styles.module.less";
import * as monaco from "monaco-editor";

const DiffPage: React.FC = () => {
    const [renderSideBySide, setRenderSideBySide] = useState(false);

    const [editorWidth, setEditorWidth] = useState('100vh');

    const [theme, setTheme] = useState('vs-dark');

    // 定义 Monokai 主题
    useEffect(() => {
        try {
            monaco.editor.defineTheme("monokai", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "", foreground: "F8F8F2", background: "272822" },
                    { token: "comment", foreground: "75715E" },
                    { token: "keyword", foreground: "F92672" },
                    { token: "number", foreground: "AE81FF" },
                    { token: "string", foreground: "E6DB74" },
                    { token: "variable", foreground: "A6E22E" },
                    { token: "type", foreground: "66D9EF" },
                    { token: "delimiter", foreground: "F8F8F2" },
                    { token: "operator", foreground: "F8F8F2" },
                    { token: "identifier", foreground: "A6E22E" },
                ],
                colors: {
                    "editor.background": "#272822",
                    "editor.foreground": "#F8F8F2",
                    "editorCursor.foreground": "#F8F8F0",
                    "editor.lineHighlightBackground": "#3E3D32",
                    "editorLineNumber.foreground": "#8F908A",
                    "editor.selectionBackground": "#49483E",
                    "editor.inactiveSelectionBackground": "#3E3D32",
                    "editorBracketMatch.background": "#3E3D32",
                    "editorBracketMatch.border": "#A6E22E",
                },
            });
        } catch (error) {
            console.error("Failed to define monokai theme:", error);
        }
    }, []);
    
    const originalCode = `# -*- coding: utf-8 -*-
"""
示例：使用 pandas 读取 Excel，并进行简单的数据预览。
运行此脚本前，请确保已安装 pandas：

    pip install pandas openpyxl
"""

import pandas as pd


def load_excel(filepath: str, sheet_name: int | str = 0) -> pd.DataFrame:
    """
    读取 Excel 文件并返回 DataFrame

    :param filepath: Excel 文件路径，例如 'data.xlsx'
    :param sheet_name: 工作表名称或索引，默认第一个工作表
    :return: pandas.DataFrame
    """
    df = pd.read_excel(filepath, sheet_name=sheet_name)
    print("=== 基本信息 ===")
    print(df.info())
    print("\\n=== 前几行预览 ===")
    print(df.head())
    return df


def main():
    input_path = "data.xlsx"
    df = load_excel(input_path)


if __name__ == "__main__":
    main()`;

    const modifiedCode = `# -*- coding: utf-8 -*-
"""
示例：使用 pandas 读取 Excel，并进行数据处理与导出。
运行此脚本前，请确保已安装 pandas 与 openpyxl：

    pip install pandas openpyxl
"""

import pandas as pd


def load_excel(filepath: str, sheet_name: int | str = 0) -> pd.DataFrame:
    """
    读取 Excel 文件并返回 DataFrame

    :param filepath: Excel 文件路径，例如 'data.xlsx'
    :param sheet_name: 工作表名称或索引，默认第一个工作表
    :return: pandas.DataFrame
    """
    df = pd.read_excel(filepath, sheet_name=sheet_name)
    print("=== 基本信息 ===")
    print(df.info())
    print("\\n=== 前几行预览 ===")
    print(df.head(10))  # 显示更多行
    return df


def simple_transform(df: pd.DataFrame) -> pd.DataFrame:
    """对数据做一个简单的处理示例。"""
    # 选择前 10 行
    top10 = df.head(10).copy()
    # 新增一列（行号）
    top10["row_no"] = range(1, len(top10) + 1)
    return top10


def main():
    input_path = "data.xlsx"
    output_path = "output.csv"  # 新增输出路径
    
    df = load_excel(input_path)
    result = simple_transform(df)  # 新增数据处理
    result.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"已将处理结果保存到: {output_path}")


if __name__ == "__main__":
    main()`;

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
                
                <div className={styles.configOption}>
                    <label>
                        编辑器主题: 
                        <select 
                            value={theme} 
                            onChange={(e) => setTheme(e.target.value)}
                            className={styles.widthSelector}
                        >
                            <option value="vs">Light (默认浅色)</option>
                            <option value="vs-dark">Dark (默认深色)</option>
                            <option value="monokai">Monokai (经典深色)</option>
                        </select>
                    </label>
                    <p className={styles.helpText}>
                        选择编辑器主题风格
                    </p>
                </div>
            </div>

            {/* DiffEditor */}
            <DiffEditor
                // === DiffEditor 组件属性 (6个) ===
                width={editorWidth}              // 1. 编辑器宽度 - 可设置为像素值、百分比或vh单位
                height='55vh'                    // 2. 编辑器高度 - 固定为40vh (视口高度的40%)
                language='python'               // 3. 语言模式 - 设置语法高亮和智能提示语言
                original={originalCode}          // 4. 原始代码 - 左侧显示的原始版本代码
                modified={modifiedCode}          // 5. 修改后代码 - 右侧显示的修改版本代码
                theme={theme}                        // 6. 编辑器主题 - 动态切换主题 (vs/vs-dark/monokai)
                
                // === options 配置对象 (11个配置项) ===
                options={{
                    // --- Diff 专有配置 (5个) ---
                    renderSideBySide: renderSideBySide,        // 7. 渲染模式 - true:并排显示, false:内联显示
                    enableSplitViewResizing: true,             // 8. 分割视图调整 - 允许拖拽调整左右面板宽度
                    diffCodeLens: true,                        // 9. Diff代码透镜 - 显示差异统计信息
                    diffAlgorithm: 'advanced',                 // 10. Diff算法 - 'legacy'|'advanced', 高级算法更精确
                    readOnly: false,                           // 11. 只读模式 - false:可编辑, true:只读
                    
                    // --- 编辑器通用配置 (6个) ---
                    automaticLayout: true,                     // 12. 自动布局 - 容器尺寸变化时自动调整编辑器
                    fontSize: 14,                             // 13. 字体大小 - 编辑器文本字体大小(像素)
                    lineNumbers: 'on',                        // 14. 行号显示 - 'on'|'off'|'relative'|'interval'
                    minimap: { enabled: true },               // 15. 小地图 - 代码缩略图导航器
                    scrollBeyondLastLine: false,              // 16. 末行滚动 - 是否允许滚动到最后一行之后
                    wordWrap: 'on',                          // 17. 自动换行 - 'on'|'off'|'wordWrapColumn'|'bounded'
                }}
            />
        </div>
    );
};

export default DiffPage;
