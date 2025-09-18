import { PageContainer } from '@ant-design/pro-components';

import React, { useEffect, useRef, useState } from 'react';
import {
    Panel,
    PanelGroup,
    type ImperativePanelHandle,
} from 'react-resizable-panels';
import PanelHandle from '@/components/base/panel-handle';

import './styles.less';
import { Copilot } from '@/pages/Helper/components';

import * as monaco from 'monaco-editor';
import { setupContextMenuFeature } from '@/components/base/editor/utils/setupContextMenuFeature';

const HelperPage: React.FC = () => {

    // ==================== State =================
    const [copilotOpen, setCopilotOpen] = useState(false);
    const copilotRef = useRef<ImperativePanelHandle>(null);
    const editorContainerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        const container = editorContainerRef.current;
        if (!container) return;

        const editor = monaco.editor.create(container, {
            value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'typescript'
        });
        editorRef.current = editor;

        setupContextMenuFeature(editor, {
            copolitRef: copilotRef,
        });

        return () => {
            editorRef.current?.dispose();
            editorRef.current = null;
        };
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
                                    <div id="editor" ref={editorContainerRef}></div>
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
