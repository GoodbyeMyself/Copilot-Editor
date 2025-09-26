import React, { useEffect, useRef, useState } from 'react';

import './styles.less';

// 编辑器
import Editor from '@/components/base/monaco';

// 助手式 公共布局
import CopilotLayout from '@/layouts/Copilot/layout';

// --------- 样例代码通过异步加载 ---------

const HelperPage: React.FC = () => {

    // ==================== State =================
    const [editorValue, setEditorValue] = useState('');
    
    const editorRef = useRef<any>(null);
    const copilotRef = useRef<any>(null);

    // 编辑器内容变化处理函数
    const handleEditorChange = (value: string) => {
        setEditorValue(value);
    };

    // 编辑器保存处理函数
    const handleEditorSave = async (editor: any) => {
        console.log('保存编辑器内容:', editor.getValue());
    };

    // 异步加载初始代码
    async function loadInitialCode() {
        try {
            const response = await fetch('./suggestions/initial-code.js');
            const initialCode = await response.text();
            setEditorValue(initialCode);
        } catch (error) {
            console.error('Failed to load initial code:', error);
        }
    }

    useEffect(() => {
        loadInitialCode();
    }, []);

    return (
        <div className="editor-container">
            <CopilotLayout 
                onCopilotRefReady={(ref) => { copilotRef.current = ref.current; }}
            >
                <Editor
                    value={editorValue}
                    onChange={handleEditorChange}
                    onSave={handleEditorSave}
                    language="javascript"
                    ref={editorRef}
                    copolitRef={copilotRef}
                    className="h-full"
                />
            </CopilotLayout>
        </div>
    );
};

export default HelperPage;
