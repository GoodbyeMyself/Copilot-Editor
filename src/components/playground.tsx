import { useRef, useState } from "react";

import {
    Panel,
    PanelGroup,
    type ImperativePanelHandle,
} from "react-resizable-panels";

import PanelHandle from "@/components/base/panel-handle";

import Copolitpanel from "./copolitpanel";
import EditorPanel from "./editor-panel";
import Sidepanel from "./sidepanel";

export default function Playground() {
    // 工作空间 区域
    const sidepanelRef = useRef<ImperativePanelHandle>(null);

    // copolit 区域
    const copolitRef = useRef<ImperativePanelHandle>(null);

    const [explorerIsOpen, setExplorerIsOpen] = useState(false);

    const [copolitIsOpen, setCopolitIsOpen] = useState(false);

    return (
        <div className="flex size-full bg-inherit">
            <PanelGroup
                className="h-[calc(100vh-64px)] rounded-none"
                direction="horizontal"
                autoSaveId="_desktop-layout-panel-group"
            >
                <Panel
                    collapsedSize={0}
                    collapsible
                    defaultSize={15}
                    minSize={15}
                    className="max-h-full"
                    onCollapse={() => setExplorerIsOpen(false)}
                    onExpand={() => setExplorerIsOpen(true)}
                    ref={sidepanelRef}
                >
                    <Sidepanel isCollapsed={!explorerIsOpen} />
                </Panel>
                <PanelHandle />
                <Panel
                    minSize={15}
                    className="h-full max-h-full max-w-full"
                >
                    <EditorPanel copolitRef={copolitRef} />
                </Panel>
                {copolitIsOpen && <PanelHandle />}
                <Panel
                    collapsedSize={0}
                    collapsible
                    defaultSize={0}
                    minSize={25}
                    className="max-h-full"
                    onCollapse={() => setCopolitIsOpen(false)}
                    onExpand={() => setCopolitIsOpen(true)}
                    ref={copolitRef}
                >
                    {/* Copolit chat 区域 */}
                    <Copolitpanel
                        isCollapsed={!copolitIsOpen}
                        copolitRef={copolitRef}
                    ></Copolitpanel>
                </Panel>
            </PanelGroup>
        </div>
    );
}
