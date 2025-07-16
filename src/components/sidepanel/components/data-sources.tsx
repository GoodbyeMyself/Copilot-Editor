// icon
import {
    ArrowDownToDot,
    Database,
    Inbox,
    Plus,
    Trash2,
    Table,
    Type,
} from "lucide-react";

import { useState } from "react";
import { DownOutlined } from '@ant-design/icons';
import { Tree, TreeDataNode } from "antd";
import type { TreeProps } from "antd/es/tree";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/base/ui/alert-dialog";

import { Button } from "@/components/base/ui/button";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/base/ui/context-menu";

import {
    DropdownMenu,
    DropdownMenuTrigger,
} from "@/components/base/ui/dropdown-menu";

import { useEditor } from "@/context/editor/useEditor";

import { useSession } from "@/context/session/useSession";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

/**
 * Manage datasets.
 *
 * @component
 */
function SourcesToolbar() {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => console.log(1)}
                    >
                        <Plus size={16} />
                    </Button>
                </DropdownMenuTrigger>
            </DropdownMenu>
        </>
    );
}

// 模拟三级树形数据：数据源 -> 数据表 -> 字段
const mockTreeData: TreeDataNode[] = [
    {
        title: '用户数据库',
        key: 'db1',
        icon: <Database size={16} />,
        children: [
            {
                title: '用户表',
                key: 'db1-users',
                icon: <Table size={16} />,
                children: [
                    {
                        title: 'id',
                        key: 'db1-users-id',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'username',
                        key: 'db1-users-username',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'email',
                        key: 'db1-users-email',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'created_at',
                        key: 'db1-users-created_at',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                ],
            },
            {
                title: '订单表',
                key: 'db1-orders',
                icon: <Table size={16} />,
                children: [
                    {
                        title: 'id',
                        key: 'db1-orders-id',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'user_id',
                        key: 'db1-orders-user_id',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'amount',
                        key: 'db1-orders-amount',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'status',
                        key: 'db1-orders-status',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                ],
            },
        ],
    },
    {
        title: '产品数据库',
        key: 'db2',
        icon: <Database size={16} />,
        children: [
            {
                title: '产品表',
                key: 'db2-products',
                icon: <Table size={16} />,
                children: [
                    {
                        title: 'id',
                        key: 'db2-products-id',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'name',
                        key: 'db2-products-name',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'price',
                        key: 'db2-products-price',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'description',
                        key: 'db2-products-description',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                ],
            },
            {
                title: '分类表',
                key: 'db2-categories',
                icon: <Table size={16} />,
                children: [
                    {
                        title: 'id',
                        key: 'db2-categories-id',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'name',
                        key: 'db2-categories-name',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'parent_id',
                        key: 'db2-categories-parent_id',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                ],
            },
        ],
    },
    {
        title: '日志数据库',
        key: 'db3',
        icon: <Database size={16} />,
        children: [
            {
                title: '访问日志表',
                key: 'db3-access_logs',
                icon: <Table size={16} />,
                children: [
                    {
                        title: 'id',
                        key: 'db3-access_logs-id',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'user_id',
                        key: 'db3-access_logs-user_id',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'ip_address',
                        key: 'db3-access_logs-ip_address',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'timestamp',
                        key: 'db3-access_logs-timestamp',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                    {
                        title: 'action',
                        key: 'db3-access_logs-action',
                        icon: <Type size={14} />,
                        isLeaf: true,
                    },
                ],
            },
        ],
    },
];

function DataSourcesTree() {
    // const { copyToClipboard } = useCopyToClipboard();

    // const { editorRef } = useEditor();

    // const onCopy = async (nodeKey: string, nodeTitle: string) => {
    //     let snippet = "";
        
    //     // 根据节点类型生成不同的 SQL
    //     if (nodeKey.includes('-') && !nodeKey.split('-')[2]) {
    //         // 数据表级别
    //         snippet = `SELECT * FROM ${nodeTitle} LIMIT 10;`;
    //     } else if (nodeKey.split('-').length === 3) {
    //         // 字段级别
    //         const parts = nodeKey.split('-');
    //         const tableName = parts[1];
    //         snippet = `SELECT ${nodeTitle} FROM ${tableName};`;
    //     } else {
    //         // 数据库级别
    //         snippet = `-- 数据库: ${nodeTitle}\nSHOW TABLES;`;
    //     }

    //     await copyToClipboard(snippet.trim());

    //     // 插入到编辑器
    //     const editor = editorRef.current?.getEditor();
    //     if (editor) {
    //         const selection = editor.getSelection();
    //         editor.executeEdits("my-source", [
    //             {
    //                 text: snippet,
    //                 forceMoveMarkers: false,
    //                 range: {
    //                     startLineNumber: selection?.selectionStartLineNumber || 1,
    //                     startColumn: selection?.selectionStartColumn || 1,
    //                     endLineNumber: selection?.endLineNumber || 1,
    //                     endColumn: selection?.endColumn || 1,
    //                 },
    //             },
    //         ]);
    //     }
    // };

    return (
        <>
            <Tree
                showIcon
                showLine
                switcherIcon={<DownOutlined />}
                defaultExpandedKeys={['db1']}
                treeData={mockTreeData}
            />
        </>
    );
}

export default function DataSources() {
    const { sources } = useSession();

    return (
        <div className="flex w-full flex-col dataSourcesTree">
            <div className="sticky top-0 z-10 flex w-full items-center justify-between bg-background">
                <div className="flex grow">
                    <span className="text-sm font-semibold px-4 py-2">数据源</span>
                </div>
                <div className="flex items-center gap-1 px-2">
                    <SourcesToolbar />
                </div>
            </div>
            <div
                className="flex max-h-[calc(100vh-200px)] w-full flex-col space-y-1 overflow-y-auto py-1 pl-4 pr-4"
            >
                {sources.length !== 0 ? (
                    <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Inbox className="size-12" />
                        <p className="text-sm">暂无数据源</p>
                        <p className="text-xs">点击上方的 + 按钮添加数据源</p>
                    </div>
                ) : (
                    <DataSourcesTree />
                )}
            </div>
        </div>
    );
}
