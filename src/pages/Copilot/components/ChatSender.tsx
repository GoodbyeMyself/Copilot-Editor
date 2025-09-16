import React from 'react';
import { Prompts } from '@ant-design/x';

import { BaseChatSender, BaseChatSenderProps } from '../../../components/shared/chat';

interface ChatSenderProps {
    senderPrompts: any[];
    inputValue: string;
    loading: boolean;
    senderHeader: React.ReactNode;
    abortController: React.MutableRefObject<AbortController | null>;
    onSubmit: (val: string) => void;
    onInputChange: (val: string) => void;
    onAttachmentsToggle: () => void;
    attachmentsOpen: boolean;
    attachedFiles: any[];
    onAttachedFilesChange: (files: any[]) => void;
}

const ChatSender: React.FC<ChatSenderProps> = ({
    senderPrompts,
    inputValue,
    loading,
    senderHeader,
    abortController,
    onSubmit,
    onInputChange,
    onAttachmentsToggle,
    attachmentsOpen,
    attachedFiles,
    onAttachedFilesChange,
}) => {
    return (
        <>
            {/* 🌟 提示词 */}
            <Prompts
                items={senderPrompts}
                onItemClick={(info) => {
                    onSubmit(info.data.description as string);
                }}
                styles={{
                    item: { padding: '6px 12px' },
                }}
                className="copilot-sender-prompt"
            />
            {/* 🌟 输入框 */}
            <BaseChatSender
                inputValue={inputValue}
                loading={loading}
                attachmentsOpen={attachmentsOpen}
                attachedFiles={attachedFiles}
                onInputValueChange={onInputChange}
                onUserSubmit={onSubmit}
                onAttachmentsOpenChange={onAttachmentsToggle}
                onAttachedFilesChange={onAttachedFilesChange}
                onAbort={() => {
                    abortController.current?.abort();
                }}
                containerClassName="copilot-sender"
                senderClassName="copilot-sender"
                speechButtonClassName="copilot-speech-button"
                header={senderHeader}
                placeholder="Ask or input / use skills"
            />
        </>
    );
};

export default ChatSender; 