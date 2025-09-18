import { PageContainer } from '@ant-design/pro-components';

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
        <PageContainer
            ghost
        >
            <div className="helper-copilot-wrapper">
                <PanelGroup direction="horizontal" className="helper-panel-group rounded-none">
                    <Panel minSize={15} className="h-full max-h-full">
                        {/** 左侧工作区 */}
                        <div className="helper-workarea helper-panel">
                            <div className="helper-workarea-header">
                                <div className="helper-workarea-header-title">
                                    <img
                                        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                                        draggable={false}
                                        alt="logo"
                                        width={20}
                                        height={20}
                                    />
                                    Python 编辑器
                                </div>
                                {!copilotOpen && (
                                    <div
                                        onClick={() => {
                                            copilotRef.current?.expand();
                                            setCopilotOpen(true);
                                        }}
                                        className="helper-workarea-header-button"
                                    >
                                        ✨ AI Copilot
                                    </div>
                                )}
                            </div>
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
        </PageContainer>
    );
};

export default HelperPage;
