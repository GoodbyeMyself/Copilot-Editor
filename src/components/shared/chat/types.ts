import { GetProp } from 'antd';
import { Attachments } from '@ant-design/x';

// 消息相关类型
export interface Message {
    id?: string;
    key?: string;
    content?: string;
    role: 'user' | 'assistant';
    meta?: {
        durationSec?: number;
    };
}

export interface ChatMessage {
    message: Message;
    status?: 'loading' | 'success' | 'error';
    id?: string;
    key?: string;
}

// 思考过程解析结果
export interface ThinkContent {
    think: string;
    rest: string;
    hasThink: boolean;
    thinkClosed: boolean;
}

// 状态图标类型
export type StatusType = 'pending' | 'success' | 'error';

// 文件上传相关类型
export type AttachedFiles = GetProp<typeof Attachments, 'items'>;

// 聊天列表组件 Props
export interface BaseChatListProps {
    messages: ChatMessage[];
    className?: string;
    onUserSubmit?: (val: string) => void;
}

// 聊天发送器组件 Props
export interface BaseChatSenderProps {
    inputValue: string;
    loading: boolean;
    attachmentsOpen: boolean;
    attachedFiles: AttachedFiles;
    onInputValueChange: (value: string) => void;
    onUserSubmit: (val: string) => void;
    onAttachmentsOpenChange: (open: boolean) => void;
    onAttachedFilesChange: (files: AttachedFiles) => void;
    onAbort: () => void;
    onPasteFile?: (file: File, files: FileList) => void;
}

// 发送器头部组件 Props
export interface BaseSenderHeaderProps {
    attachmentsOpen: boolean;
    attachedFiles: AttachedFiles;
    onAttachmentsOpenChange: (open: boolean) => void;
    onAttachedFilesChange: (files: AttachedFiles) => void;
}