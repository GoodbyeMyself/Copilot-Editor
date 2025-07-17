// icon
import {
    Inbox,
    MoreVertical,
    Trash2,
    ArrowDownToDot,
} from "lucide-react";

import { DownOutlined } from '@ant-design/icons';
import { Tree, Button, Dropdown, MenuProps, Modal, App } from "antd";

import { useEditor } from "@/context/editor/useEditor";

import { useSession } from "@/context/session/useSession";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import { convertTreeDataSourcesToAntdTree, getNodeTypeFromKey } from "@/utils/data-source-converter";

import { TreeDataSource } from "@/types/files/dataset";

import { useState } from "react";

import './data-sources.module.less';

// 节点类型枚举
enum NodeType {
    DATABASE = 'database',
    TABLE = 'table', 
    FIELD = 'field'
}

// 获取节点类型
function getNodeType(nodeKey: string): NodeType {
    const nodeType = getNodeTypeFromKey(nodeKey);
    switch (nodeType) {
        case 'database':
            return NodeType.DATABASE;
        case 'table':
            return NodeType.TABLE;
        case 'field':
            return NodeType.FIELD;
        default:
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
    const { editors } = useSession();
    const { message } = App.useApp();
    const nodeType = getNodeType(nodeKey);

    // 检查是否有SQL文件打开
    const checkSQLEditorOpen = () => {
        const openSQLEditors = editors.filter(editor => 
            editor.isOpen && (editor.ext === 'sql' || editor.mimeType === 'text/sql')
        );
        return openSQLEditors.length > 0;
    };

    const handleInsertSQL = async () => {
        // 检查是否有SQL文件打开
        if (!checkSQLEditorOpen()) {
            message.warning('请先打开一个SQL文件');
            return;
        }

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
                        {nodeType === NodeType.DATABASE && '插入数据库'}
                        {nodeType === NodeType.TABLE && '插入数据表'}
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
                    <span className='deleteMenuItem'>
                        <Trash2 size={16} className='deleteMenuIcon' />
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
                className='moreButton'
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

    const { copyToClipboard } = useCopyToClipboard();

    const { editorRef } = useEditor();

    const { editors } = useSession();

    const { message } = App.useApp();
    
    const nodeType = getNodeType(nodeKey);

    // 检查是否有SQL文件打开
    const checkSQLEditorOpen = () => {
        const openSQLEditors = editors.filter(editor => 
            editor.isOpen && (editor.ext === 'sql' || editor.mimeType === 'text/sql')
        );
        return openSQLEditors.length > 0;
    };

    // 处理字段点击，直接插入SQL
    const handleFieldClick = async (e: React.MouseEvent) => {
        if (nodeType === NodeType.FIELD) {
            e.stopPropagation();
            
            // 检查是否有SQL文件打开
            if (!checkSQLEditorOpen()) {
                message.warning('请先打开一个 SQL 文件');
                return;
            }
            
            const fieldName = children as string;
            const snippet = ` ${fieldName} `;

            await copyToClipboard(snippet);

            // 插入到编辑器光标位置
            const editor = editorRef.current?.getEditor();
            if (editor) {
                const position = editor.getPosition();
                if (position) {
                    editor.executeEdits("insert-field", [
                        {
                            text: snippet,
                            forceMoveMarkers: false,
                            range: {
                                startLineNumber: position.lineNumber,
                                startColumn: position.column,
                                endLineNumber: position.lineNumber,
                                endColumn: position.column,
                            },
                        },
                    ]);
                    
                    // 移动光标到插入文本之后
                    const newPosition = {
                        lineNumber: position.lineNumber,
                        column: position.column + snippet.length,
                    };
                    editor.setPosition(newPosition);
                    
                    // 聚焦编辑器
                    editor.focus();
                }
            }
        }
    };

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleFieldClick}
            className={`${'customTreeTitle'} ${nodeType === NodeType.FIELD ? 'customTreeTitleField' : ''}`}
        >
            <span className='titleText'>
                {children}
            </span>
            {/* 只有非字段节点才显示操作按钮 */}
            {nodeType !== NodeType.FIELD && (
                <div
                    className={`antd-tree-button-wamper ${'buttonWrapper'} ${isHovered ? 'buttonWrapperVisible' : 'buttonWrapperHidden'}`}
                >
                    <NodeMoreActions 
                        nodeKey={nodeKey} 
                        nodeTitle={children as string} 
                        onDeleteDataSource={onDeleteDataSource}
                    />
                </div>
            )}
        </div>
    );
}

function DataSourcesTree() {
    const { sources, onRemoveDataSource } = useSession();

    // 过滤出树形数据源
    const treeDataSources = sources.filter(source => 
        source.kind === "TREE_DATASET"
    ) as TreeDataSource[];

    // 转换为 Ant Design Tree 需要的格式，传递删除函数给自定义标题组件
    const CustomTitleWithDelete = ({ nodeKey, children }: { 
        nodeKey: string; 
        children: React.ReactNode; 
    }) => (
        <CustomTreeTitle 
            nodeKey={nodeKey} 
            onDeleteDataSource={onRemoveDataSource}
        >
            {children}
        </CustomTreeTitle>
    );

    const processedTreeData = convertTreeDataSourcesToAntdTree(
        treeDataSources, 
        CustomTitleWithDelete
    );

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
        <div className="flex h-full w-full flex-col dataSourcesTree">
            <div className="sticky top-0 z-10 flex w-full items-center justify-between bg-background">
                <div className="flex grow">
                    <span className="text-sm font-semibold px-4 py-2">数据源</span>
                </div>
            </div>
            <div
                className="flex h-full w-full flex-col space-y-1 overflow-y-auto py-1 pl-4 pr-2"
            >
                {sources.length === 0 ? (
                    <div className="flex h-[200px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Inbox className="size-12" />
                        <p className="text-sm">暂无数据源</p>
                    </div>
                ) : (
                    <DataSourcesTree />
                )}
            </div>
        </div>
    );
}
