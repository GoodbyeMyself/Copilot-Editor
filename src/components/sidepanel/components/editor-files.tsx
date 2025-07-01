import {
    Code,
    Dot,
    FileText,
    FolderPen,
    PanelLeftOpen,
    Plus,
    Trash2,
} from "lucide-react";

import { useState } from "react";

import { z } from "zod";

import {
    Button,
    Modal,
    Dropdown,
    Input,
    Form,
    Space,
    Empty,
    Typography,
    message,
} from "antd";

import { MoreOutlined } from "@ant-design/icons";

import type { CodeEditor } from "@/context/session/types";

import { useSession } from "@/context/session/useSession";

import { cn } from "@/lib/utils";

const { Text } = Typography;

type DeleteModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    path: string;
};

/**
 * Delete the editor (not close the file).
 */
function DeleteEditorModal(props: DeleteModalProps) {
    const { isOpen, onOpenChange, path } = props;

    const { onDeleteEditor } = useSession();

    const handleOk = async () => {
        await onDeleteEditor(path);
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Modal
            title="确定要删除所选 SQL 文件吗？"
            open={isOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确认"
            cancelText="取消"
            okType="danger"
        >
            <Text type="secondary">
                此操作无法撤销，这将永久删除该 SQL 文件
            </Text>
        </Modal>
    );
}

type RenameModalProps = {
    filename: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

const filenameSchema = z.string().endsWith(".sql");

function RenameModal(props: RenameModalProps) {
    const { filename, isOpen, onOpenChange } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [form] = Form.useForm();

    const { onRenameEditor } = useSession();

    const onSubmitHandler = async (values: { file: string }) => {
        setIsLoading(true);
        const newName = values.file;

        const validation = filenameSchema.safeParse(newName);
        if (!validation.success) {
            message.error("文件名必须以 .sql 结尾");
            setIsLoading(false);
            return;
        }

        try {
            await onRenameEditor(filename, newName);
            message.success(`文件名从 ${filename} 变更到 ${newName}`);
            form.resetFields();
            onOpenChange(false);
        } catch (e) {
            message.error("重命名文件失败");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onOpenChange(false);
    };

    const handleOk = () => {
        form.submit();
    };

    return (
        <Modal
            title="重命名文件"
            open={isOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="保存"
            cancelText="取消"
            confirmLoading={isLoading}
            width={400}
        >
            <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                    请输入新的文件名，包含文件扩展名
                </Text>
            </div>
            <Form
                form={form}
                onFinish={onSubmitHandler}
                layout="vertical"
                initialValues={{ file: filename }}
            >
                <Form.Item
                    label="文件名"
                    name="file"
                    rules={[{ required: true, message: '请输入文件名' }]}
                >
                    <Input placeholder="请输入文件名" />
                </Form.Item>
            </Form>
        </Modal>
    );
}

function CodeEditorItem(editor: CodeEditor) {
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const { dispatch } = useSession();

    const onOpenFile = () => {
        if (!dispatch) return;

        if (!editor) {
            message.error("Editor not found");
            return;
        }
        dispatch({
            type: "FOCUS_EDITOR",
            payload: editor,
        });
    };

    const menuItems = [
        {
            key: 'open',
            icon: <PanelLeftOpen size={16} />,
            label: '打开',
            onClick: () => onOpenFile(),
        },
        {
            key: 'rename',
            icon: <FolderPen size={16} />,
            label: '重命名',
            onClick: () => setIsEditing(true),
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'delete',
            icon: <Trash2 size={16} />,
            label: '删除',
            danger: true,
            onClick: () => setShowDelete(true),
        },
    ];

    const { isFocused } = editor;

    return (
        <>
            <div
                className={cn(
                    "group flex h-8 w-full items-center justify-between gap-2 overflow-hidden px-2 py-1 rounded hover:bg-gray-50 cursor-pointer transition-colors",
                    isFocused && "bg-blue-50 border border-blue-200",
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onOpenFile}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Code
                        className={cn(
                            "size-4 shrink-0",
                            editor.isDirty && "text-orange-500",
                        )}
                    />
                    <span
                        className={cn(
                            "text-sm truncate",
                            editor.isDirty && "text-orange-500",
                        )}
                        title={editor.path}
                    >
                        {editor.path}
                    </span>
                    {editor.isDirty && (
                        <Dot className="size-4 shrink-0 text-orange-500" />
                    )}
                </div>

                <div className={cn(
                    "opacity-0 transition-opacity",
                    isHovered && "opacity-100"
                )}>
                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        placement="bottomLeft"
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<MoreOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className="h-6 w-6 p-0 flex items-center justify-center"
                        />
                    </Dropdown>
                </div>
            </div>

            <RenameModal
                filename={editor.path}
                isOpen={isEditing}
                onOpenChange={(open) => setIsEditing(open)}
            />

            <DeleteEditorModal
                isOpen={showDelete}
                onOpenChange={(open) => setShowDelete(open)}
                path={editor.path}
            />
        </>
    );
}

/**
 * Manage datasets.
 *
 * #TODO: remote sources.
 *
 * @component
 */
function SourcesToolbar() {
    const { onAddEditor } = useSession();

    return (
        <Button
            size="small"
            type="text"
            onClick={onAddEditor}
            icon={<Plus size={16} />}
        />
    );
}

export default function EditorSources() {
    const { editors } = useSession();

    return (
        <div className="flex w-full flex-col">
            <div className="sticky top-0 z-10 flex w-full items-center justify-between bg-background">
                <div className="flex grow items-center">
                    <div
                        className="flex w-full items-center justify-start gap-1 rounded-none"
                        style={{ height: 'auto' }}
                    >
                        <span className="text-sm font-semibold px-4 py-3">工作空间</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 px-2">
                    <SourcesToolbar />
                </div>
            </div>
            <div
                className="flex max-h-[calc(100vh-220px)] w-full flex-col space-y-1 overflow-y-auto"
                style={{ 
                    marginTop: '4px',
                    paddingLeft: '16px', 
                    paddingRight: '16px',
                    paddingTop: '0px',
                    paddingBottom: '8px'
                }}
            >
                {editors.length === 0 ? (
                    <Empty
                        image={<FileText className="size-6" />}
                        description="暂无可编辑的文件"
                        style={{ padding: '40px 0' }}
                    />
                ) : (
                    <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        {editors.map((editor) => (
                            <CodeEditorItem
                                key={editor.path}
                                {...editor}
                            />
                        ))}
                    </Space>
                )}
            </div>
        </div>
    );
}
