// icon
import {
    Database,
    Inbox,
    Plus,
    Table,
    Type,
    MoreVertical,
    Trash2,
    ArrowDownToDot,
} from "lucide-react";

import { DownOutlined } from '@ant-design/icons';
import { Tree, TreeDataNode, Button, Dropdown, MenuProps, Modal, message } from "antd";

import { useEditor } from "@/context/editor/useEditor";

import { useSession } from "@/context/session/useSession";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import { useState } from "react";

/**
 * Manage datasets.
 *
 * @component
 */
function SourcesToolbar() {
    return (
        <>
            <Button
                type="text"
                size="small"
                icon={<Plus size={16} />}
                onClick={() => console.log(1)}
            />
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

// 节点类型枚举
enum NodeType {
    DATABASE = 'database',
    TABLE = 'table', 
    FIELD = 'field'
}

// 获取节点类型
function getNodeType(nodeKey: string): NodeType {
    const parts = nodeKey.split('-');
    if (parts.length === 1) {
        return NodeType.DATABASE;
    } else if (parts.length === 2) {
        return NodeType.TABLE;
    } else {
        return NodeType.FIELD;
    }
}

// 更多操作按钮组件
function NodeMoreActions({ 
    nodeKey, 
    nodeTitle, 
    onDeleteDataSource 
}: { 
    nodeKey: string; 
    nodeTitle: string;
    onDeleteDataSource?: (nodeKey: string) => void;
}) {
    const { copyToClipboard } = useCopyToClipboard();
    const { editorRef } = useEditor();
    const nodeType = getNodeType(nodeKey);

    const handleInsertSQL = async () => {
        let snippet = "";
        
        // 根据节点类型生成不同的 SQL
        switch (nodeType) {
            case NodeType.DATABASE:
                snippet = `-- 数据库: ${nodeTitle}\nSHOW TABLES;`;
                break;
            case NodeType.TABLE:
                snippet = `SELECT * FROM ${nodeTitle} LIMIT 10;`;
                break;
            case NodeType.FIELD: {
                const parts = nodeKey.split('-');
                const tableName = parts[1];
                snippet = `SELECT ${nodeTitle} FROM ${tableName};`;
                break;
            }
        }

        await copyToClipboard(snippet.trim());

        // 插入到编辑器
        const editor = editorRef.current?.getEditor();
        if (editor) {
            const selection = editor.getSelection();
            const position = selection ? {
                lineNumber: selection.endLineNumber,
                column: selection.endColumn
            } : editor.getPosition() || { lineNumber: 1, column: 1 };

            editor.executeEdits("insert-sql", [
                {
                    text: snippet + '\n',
                    forceMoveMarkers: false,
                    range: {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    },
                },
            ]);
            
            // 聚焦编辑器
            editor.focus();
        }
    };

    const handleDelete = () => {
        Modal.confirm({
            title: '确认删除数据源',
            content: `确定要删除数据源 "${nodeTitle}" 吗？此操作不可撤销。`,
            okText: '确认删除',
            cancelText: '取消',
            okType: 'danger',
            onOk() {
                try {
                    // 调用删除函数
                    if (onDeleteDataSource) {
                        onDeleteDataSource(nodeKey);
                        // 显示成功消息
                        message.success(`数据源 "${nodeTitle}" 已删除`);
                    }
                } catch (error) {
                    console.error('删除数据源失败:', error);
                    message.error('删除数据源失败，请重试');
                }
            },
            onCancel() {
                console.log('取消删除操作');
            },
        });
    };

    // 构建菜单项
    const getMenuItems = (): MenuProps['items'] => {
        const baseItems = [
            {
                key: 'insert-sql',
                label: (
                    <span>
                        <ArrowDownToDot size={16} />
                        {nodeType === NodeType.DATABASE && '插入SQL'}
                        {nodeType === NodeType.TABLE && '插入表SQL'}
                        {nodeType === NodeType.FIELD && '插入字段SQL'}
                    </span>
                ),
                onClick: () => {
                    handleInsertSQL();
                },
            },
        ];

        if (nodeType === NodeType.DATABASE) {
            baseItems.push({
                key: 'delete',
                label: (
                    <span style={{ color: '#ff4d4f' }}>
                        <Trash2 size={16} style={{ marginRight: 8 }} />
                        删除数据源
                    </span>
                ),
                onClick: handleDelete,
            });
        }

        return baseItems;
    };

    return (
        <Dropdown
            menu={{ items: getMenuItems() }}
            placement="bottomRight"
            trigger={['click']}
        >
            <Button
                type="text"
                size="small"
                icon={<MoreVertical size={12} />}
                style={{ 
                    width: 24, 
                    height: 24, 
                    padding: 0
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            />
        </Dropdown>
    );
}

// 自定义树节点标题组件
function CustomTreeTitle({ 
    nodeKey, 
    children, 
    onDeleteDataSource 
}: { 
    nodeKey: string; 
    children: React.ReactNode;
    onDeleteDataSource?: (nodeKey: string) => void;
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span style={{ flex: 1 }}>
                {children}
            </span>
            <div
                className='antd-tree-button-wamper'
                style={{
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.2s'
                }}
            >
                <NodeMoreActions 
                    nodeKey={nodeKey} 
                    nodeTitle={children as string} 
                    onDeleteDataSource={onDeleteDataSource}
                />
            </div>
        </div>
    );
}

// 处理树形数据，为每个节点添加自定义标题
function processTreeData(data: TreeDataNode[], handleDeleteDataSource: (nodeKey: string) => void): TreeDataNode[] {
    return data.map(node => ({
        ...node,
        title: (
            <CustomTreeTitle 
                nodeKey={node.key as string} 
                onDeleteDataSource={handleDeleteDataSource}
            >
                {node.title as React.ReactNode}
            </CustomTreeTitle>
        ),
        children: node.children ? processTreeData(node.children, handleDeleteDataSource) : undefined,
    }));
}

function DataSourcesTree() {
    const [treeData, setTreeData] = useState<TreeDataNode[]>(mockTreeData);

    // 删除数据源节点的函数
    const handleDeleteDataSource = (nodeKey: string) => {
        setTreeData(prevData => {
            return prevData.filter(node => node.key !== nodeKey);
        });
    };

    const processedTreeData = processTreeData(treeData, handleDeleteDataSource);

    return (
        <>
            <Tree
                showIcon
                showLine
                switcherIcon={<DownOutlined />}
                defaultExpandedKeys={['db1']}
                treeData={processedTreeData}
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
