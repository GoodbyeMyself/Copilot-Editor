import { PageContainer } from '@ant-design/pro-components';

import React, { useCallback, useRef, useState } from 'react';
import {
    Panel,
    PanelGroup,
    type ImperativePanelHandle,
} from 'react-resizable-panels';
import PanelHandle from '@/components/base/panel-handle';

import './styles.less';
import { Copilot } from '@/pages/Helper/components';
import Editor from '@/components/base/monaco';
import { useEditor } from '@/context/editor/useEditor';
import type { OnChange } from '@monaco-editor/react';
import type { editor as MonacoEditor } from 'monaco-editor';


const HelperPage: React.FC = () => {

    // ==================== State =================
    const [copilotOpen, setCopilotOpen] = useState(false);
    const copilotRef = useRef<ImperativePanelHandle>(null);
    const { editorRef } = useEditor();

    const [code, setCode] = useState<string>('# Python 编辑区\n# 在这里编写你的 Python 代码\n');

    const onChangeHandler: OnChange = useCallback((value) => {
        setCode(value ?? '');
    }, []);

    const onSave = useCallback(async (ed: MonacoEditor.ICodeEditor) => {
        const content = ed.getValue();
        // 这里可以对接保存逻辑，例如持久化到后端或本地
        // 先简单打印作为占位
        // eslint-disable-next-line no-console
        console.log('Python code saved:', content);
    }, []);

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
                                    助手式 Copilot
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
                                        onSave={onSave}
                                        value={code}
                                        ref={editorRef}
                                        onChange={onChangeHandler}
                                        className="h-full border-t-0"
                                        options={{
                                            padding: { top: 10, bottom: 16 },
                                        }}
                                        copolitRef={copilotRef}
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
