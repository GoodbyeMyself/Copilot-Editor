import {
    AppstoreAddOutlined,
    ProductOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';

import { Button } from 'antd';

import React from 'react';

import { BaseChatSender } from '../../../components/shared/chat';
import { MOCK_SUGGESTIONS } from '@/layouts/Copilot/constants';
import SendHeader from './SendHeader';

interface ChatSenderProps {
    inputValue: string;
    loading: boolean;
    attachmentsOpen: boolean;
    sendHeaderProps: any;
    onInputValueChange: (value: string) => void;
    onUserSubmit: (val: string) => void;
    onAttachmentsOpenChange: (open: boolean) => void;
    onAbort: () => void;
    onPasteFile: (file: File, files: FileList) => void;
    attachedFiles: any[];
    onAttachedFilesChange: (files: any[]) => void;
}

const ChatSender: React.FC<ChatSenderProps> = ({
    inputValue,
    loading,
    attachmentsOpen,
    sendHeaderProps,
    onInputValueChange,
    onUserSubmit,
    onAttachmentsOpenChange,
    onAbort,
    onPasteFile,
    attachedFiles,
    onAttachedFilesChange,
}) => {
    return (
        <div className="helper-chat-send">
            <div className="helper-send-action">
                <Button
                    icon={<ScheduleOutlined />}
                    onClick={() => onUserSubmit('Ant Design X 升级了什么 ?')}
                >
                    升级
                </Button>
                <Button
                    icon={<ProductOutlined />}
                    onClick={() => onUserSubmit('Ant Design X 中有哪些组件资产可用 ?')}
                >
                    组件
                </Button>
                <Button icon={<AppstoreAddOutlined />}>
                    更多
                </Button>
            </div>

            {/** 输入框 */}
            <BaseChatSender
                inputValue={inputValue}
                loading={loading}
                attachmentsOpen={attachmentsOpen}
                attachedFiles={attachedFiles}
                onInputValueChange={onInputValueChange}
                onUserSubmit={onUserSubmit}
                onAttachmentsOpenChange={onAttachmentsOpenChange}
                onAttachedFilesChange={onAttachedFilesChange}
                onAbort={onAbort}
                onPasteFile={onPasteFile}
                containerClassName="helper-chat-sender"
                senderClassName="helper-sender"
                speechButtonClassName="helper-speech-button"
                suggestions={MOCK_SUGGESTIONS}
                header={<SendHeader {...sendHeaderProps} />}
                placeholder="Ask or input / use skills"
            />
        </div>
    );
};

export default ChatSender; 