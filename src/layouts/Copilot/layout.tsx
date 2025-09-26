import React, { useRef, useState } from 'react';
import {
    Panel,
    PanelGroup,
    type ImperativePanelHandle,
} from 'react-resizable-panels';

import PanelHandle from '@/components/base/panel-handle';
import { Copilot } from '@/layouts/Copilot/lib';
import { cn } from "@/utils/utils";
import type { SessionEndHandler } from '@/types/session';

// 样式表
import './styles.less';

interface CopilotLayoutProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    onCopilotRefReady?: (ref: React.RefObject<ImperativePanelHandle>) => void;
    onClose?: () => void;
    onSessionEnd?: SessionEndHandler;
}

const CopilotLayout: React.FC<CopilotLayoutProps> = ({ 
    children, 
    className,
    containerClassName,
    onCopilotRefReady,
    onClose,
    onSessionEnd
}) => {
    // ==================== State =================
    const [copilotOpen, setCopilotOpen] = useState(false);
    const copilotRef = useRef<ImperativePanelHandle>(null);

    // 将copilotRef传递给父组件
    React.useEffect(() => {
        if (onCopilotRefReady) {
            onCopilotRefReady(copilotRef);
        }
    }, [onCopilotRefReady]);

    return (
        <div className={cn(
            'h-full',
            'helper-copilot-wrapper',
            containerClassName
        )}>
            <PanelGroup direction="horizontal" className="helper-panel-group rounded-none">
                <Panel minSize={15} className="h-full max-h-full">
                    {/** 左侧工作区 */}
                    <div className="helper-workarea helper-panel h-full">
                        <div
                            className={`helper-workarea-body h-full ${!copilotOpen ? 'helper-workarea-body--collapsed' : ''}`}
                        >
                            <div className={cn("helper-body-content h-full", className)}>
                                {children}
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
                    onCollapse={() => {
                        setCopilotOpen(false);
                        onClose?.();
                    }}
                    onExpand={() => setCopilotOpen(true)}
                    ref={copilotRef}
                >
                    {/** 右侧对话区 */}
                    <div className="helper-panel">
                        <Copilot
                            setCopilotOpen={setCopilotOpen}
                            onCollapsePanel={() => copilotRef.current?.collapse()}
                            onSessionEnd={onSessionEnd}
                        />
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default CopilotLayout;