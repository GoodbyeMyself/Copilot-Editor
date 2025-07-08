import React from 'react';
import { Button, Flex } from 'antd';
import { Prompts, Sender } from '@ant-design/x';
import { PaperClipOutlined } from '@ant-design/icons';

interface ChatSenderProps {
    styles: any;
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
    styles,
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
                className={styles.senderPrompt}
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
                className={styles.sender}
                allowSpeech
                actions={(_, info) => {
                    const { SendButton, LoadingButton, SpeechButton } = info.components;
                    return (
                        <Flex gap={4}>
                            <SpeechButton className={styles.speechButton} />
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