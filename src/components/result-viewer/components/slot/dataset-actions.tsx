// icon
import {
    Trash2
} from "lucide-react";

import { MoreOutlined } from "@ant-design/icons";

import { Dropdown, Modal, App } from "antd";
import type { MenuProps } from "antd";
import { del } from "idb-keyval";
import { IDB_KEYS } from "@/constants.client";
import { useState } from "react";

/**
 * Actions for the dataset.
 */
export default function DatasetActions() {
    // 使用 App.useApp() 获取 message 方法
    const { message } = App.useApp();
    
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const onClearHistory = async () => {
        await del(IDB_KEYS.QUERY_HISTORY);
        setShowClearConfirm(false);
        message.success("运行记录已清空");
        
        // 发送自定义事件通知查询历史组件更新
        window.dispatchEvent(new CustomEvent('queryHistoryCleared'));
    };

    const items: MenuProps['items'] = [
        {
            key: 'clear-history',
            label: '删除运行记录',
            icon: <Trash2 size={16} />,
            onClick: () => setShowClearConfirm(true),
        },
    ];

    return (
        <>
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                <MoreOutlined 
                    style={{ fontSize: 16 }} 
                    className="mr-2 cursor-pointer hover:text-gray-600" 
                />
            </Dropdown>

            <Modal
                title="确定要清空运行记录吗？"
                open={showClearConfirm}
                onCancel={() => setShowClearConfirm(false)}
                onOk={onClearHistory}
                okText="确认"
                cancelText="取消"
                okType="danger"
            >
                <p>此操作无法撤销，这将永久删除所有运行记录。</p>
            </Modal>
        </>
    );
}
