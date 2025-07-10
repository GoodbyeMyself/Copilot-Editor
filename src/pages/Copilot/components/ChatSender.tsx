import React from 'react';
import { Button, Flex } from 'antd';
import { Prompts, Sender } from '@ant-design/x';
import { PaperClipOutlined } from '@ant-design/icons';

interface ChatSenderProps {
    senderPrompts: any[];
    inputValue: string;
    loading: boolean;
    senderHeader: React.ReactNode;
    abortController: React.MutableRefObject<AbortController | null>;
    onSubmit: (val: string) => void;
    onInputChange: (val: string) => void;
    onAttachmentsToggle: () => void;
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
            <Sender
                value={inputValue}
                header={senderHeader}
                onSubmit={() => {
                    onSubmit(inputValue);
                    onInputChange('');
                }}
                onChange={onInputChange}
                onCancel={() => {
                    abortController.current?.abort();
                }}
                prefix={
                    <Button
                        type="text"
                        icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                        onClick={onAttachmentsToggle}
                    />
                }
                loading={loading}
                className="copilot-sender"
                allowSpeech
                actions={(_, info) => {
                    const { SendButton, LoadingButton, SpeechButton } = info.components;
                    return (
                        <Flex gap={4}>
                            <SpeechButton className="copilot-speech-button" />
                            {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                        </Flex>
                    );
                }}
                placeholder="Ask or input / use skills"
            />
        </>
    );
};

export default ChatSender; 