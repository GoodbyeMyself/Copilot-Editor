import React, { useRef, useState } from 'react';
import {
    Panel,
    PanelGroup,
    type ImperativePanelHandle,
} from 'react-resizable-panels';

import PanelHandle from '@/components/base/panel-handle';

import './styles.less';
import { Copilot } from '@/pages/Helper/components';

import Editor from '@/components/base/monaco';
import PYTHON_EXCEL_SAMPLE from './sample-code';

import { cn } from "@/lib/utils";

const HelperPage: React.FC = () => {

    // ==================== State =================
    const [copilotOpen, setCopilotOpen] = useState(false);

    const [editorValue, setEditorValue] = useState(PYTHON_EXCEL_SAMPLE);
    
    const copilotRef = useRef<ImperativePanelHandle>(null);
    
    const editorRef = useRef<any>(null);

    // 编辑器内容变化处理函数
    const handleEditorChange = (value: string) => {
        setEditorValue(value);
    };

    // 编辑器保存处理函数
    const handleEditorSave = async (editor: any) => {
        console.log('保存编辑器内容:', editor.getValue());
    };

    return (
        <div className={cn(
            "python-container"
        )}>
            <div className="helper-copilot-wrapper">
                <PanelGroup direction="horizontal" className="helper-panel-group rounded-none">
                    <Panel minSize={15} className="h-full max-h-full">
                        {/** 左侧工作区 */}
                        <div className="helper-workarea helper-panel">
                            <div
                                className={`helper-workarea-body ${!copilotOpen ? 'helper-workarea-body--collapsed' : ''}`}
                            >
                                <div className="helper-body-content">
                                    <Editor
                                        value={editorValue}
                                        onChange={handleEditorChange}
                                        onSave={handleEditorSave}
                                        language="python"
                                        ref={editorRef}
                                        copolitRef={copilotRef}
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel>
                    {copilotOpen && <PanelHandle />}
                    <Panel
                        collapsedSize={0}
                        collapsible
                        defaultSize={0}
                        minSize={30}
                        className="h-full max-h-full"
                        onCollapse={() => setCopilotOpen(false)}
                        onExpand={() => setCopilotOpen(true)}
                        ref={copilotRef}
                    >
                        {/** 右侧对话区 */}
                        <div className="helper-panel">
                            <Copilot
                                setCopilotOpen={setCopilotOpen}
                                onCollapsePanel={() => copilotRef.current?.collapse()}
                            />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};

export default HelperPage;
