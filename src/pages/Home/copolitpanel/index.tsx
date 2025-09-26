import {
    type ImperativePanelHandle,
    Panel,
    PanelGroup,
    PanelResizeHandle,
} from "react-resizable-panels";

import { Button } from "antd";

import { cn } from "@/utils/utils";

// icon
import {
    GripVertical
} from "lucide-react";

import { PlusOutlined, EllipsisOutlined, ClockCircleOutlined, CloseOutlined } from "@ant-design/icons";

type CopolitpanelProps = {
    isCollapsed: boolean;
    copolitRef?: React.RefObject<ImperativePanelHandle>;
};

export default function Sidepanel(props: CopolitpanelProps) {
    const { isCollapsed, copolitRef } = props;

    if (isCollapsed) return null;

    return (
        <div className="flex h-full flex-col border-r bg-muted/50">
            <div className="flex items-center justify-between border-b p-2">
                {/* 占位 显示会话名称 */}
                <span className="text-sm font-medium">
                    {/* -- */}
                </span>
                <div className="flex items-center space-x-2">
                    <Button
                        type="text"
                        size="small"
                        className="h-5 w-5 flex items-center justify-center"
                        onClick={() => {
                            console.log(0, '<- 新建会话');
                        }}
                        title="新建会话"
                        icon={<PlusOutlined size={16} />}
                    />
                    <Button
                        type="text"
                        size="small"
                        className="h-5 w-5 flex items-center justify-center"
                        onClick={() => {
                            console.log(1, "<- 会话列表");
                        }}
                        title="会话列表"
                        icon={<ClockCircleOutlined size={16} />}
                    />
                    <Button
                        type="text"
                        size="small"
                        className="h-5 w-5 flex items-center justify-center"
                        onClick={() => {
                            console.log(2, "<- 更多操作");
                        }}
                        title="更多操作"
                        icon={<EllipsisOutlined size={16}/>}
                    />
                    <Button
                        type="text"
                        size="small"
                        className="h-5 w-5 flex items-center justify-center"
                        onClick={() => {
                            copolitRef?.current?.collapse();
                        }}
                        icon={<CloseOutlined size={16}/>}
                    />
                </div>
            </div>
            <PanelGroup
                direction="vertical"
                className="flex-1"
            >
                <Panel
                    defaultSize={80}
                    minSize={40}
                >
                    <div className="h-full overflow-y-auto p-4">
                        xxx
                    </div>
                </Panel>

                <PanelResizeHandle
                    className={cn(
                        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
                    )}
                >
                    <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
                        <GripVertical className="size-2.5" />
                    </div>
                </PanelResizeHandle>
                <Panel
                    defaultSize={20}
                    minSize={20}
                >
                    <div className="h-full border-t bg-muted/90 p-2">
                        xxx
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
}
