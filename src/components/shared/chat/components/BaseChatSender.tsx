import React from 'react';
import { Button, Flex } from 'antd';
import { Sender, Suggestion } from '@ant-design/x';
import { PaperClipOutlined } from '@ant-design/icons';

import { BaseChatSenderProps } from '../types';

interface BaseChatSenderComponentProps extends BaseChatSenderProps {
    // 样式相关
    containerClassName?: string;
    senderClassName?: string;
    speechButtonClassName?: string;
    
    // 功能相关
    allowSpeech?: boolean;
    placeholder?: string;
    
    // 建议词相关
    suggestions?: Array<{ label: string; value: string; icon?: React.ReactNode; children?: any[] }>;
    
    // 头部组件
    header?: React.ReactNode;
}

const BaseChatSender: React.FC<BaseChatSenderComponentProps> = ({
    inputValue,
    loading,
    attachmentsOpen,
    attachedFiles,
    onInputValueChange,
    onUserSubmit,
    onAttachmentsOpenChange,
    onAttachedFilesChange,
    onAbort,
    onPasteFile,
    containerClassName = '',
    senderClassName = '',
    speechButtonClassName = '',
    allowSpeech = true,
    placeholder = "Ask or input / use skills",
    suggestions = [],
    header,
}) => {
    const handleSubmit = () => {
        onUserSubmit(inputValue);
        onInputValueChange('');
    };

    const handleChange = (value: string) => {
        onInputValueChange(value);
    };

    const renderSender = () => (
        <Sender
            loading={loading}
            value={inputValue}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={onAbort}
            allowSpeech={allowSpeech}
            placeholder={placeholder}
            className={senderClassName}
            header={header}
            prefix={
                <Button
                    type="text"
                    icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                    onClick={() => onAttachmentsOpenChange(!attachmentsOpen)}
                />
            }
            onPasteFile={onPasteFile}
            actions={(_, info) => {
                const { SendButton, LoadingButton, SpeechButton } = info.components;
                return (
                    <Flex gap={4}>
                        {allowSpeech && <SpeechButton className={speechButtonClassName} />}
                        {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                    </Flex>
                );
            }}
        />
    );

    return (
        <div className={`base-chat-sender ${containerClassName}`}>
            {suggestions.length > 0 ? (
                <Suggestion 
                    items={suggestions} 
                    onSelect={(itemVal) => onInputValueChange(`[${itemVal}]:`)}
                >
                    {({ onTrigger, onKeyDown }) => (
                        <Sender
                            loading={loading}
                            value={inputValue}
                            onChange={(v) => {
                                onTrigger(v === '/');
                                onInputValueChange(v);
                            }}
                            onSubmit={handleSubmit}
                            onCancel={onAbort}
                            allowSpeech={allowSpeech}
                            placeholder={placeholder}
                            className={senderClassName}
                            onKeyDown={onKeyDown}
                            header={header}
                            prefix={
                                <Button
                                    type="text"
                                    icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                                    onClick={() => onAttachmentsOpenChange(!attachmentsOpen)}
                                />
                            }
                            onPasteFile={onPasteFile}
                            actions={(_, info) => {
                                const { SendButton, LoadingButton, SpeechButton } = info.components;
                                return (
                                    <Flex gap={4}>
                                        {allowSpeech && <SpeechButton className={speechButtonClassName} />}
                                        {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                                    </Flex>
                                );
                            }}
                        />
                    )}
                </Suggestion>
            ) : (
                renderSender()
            )}
        </div>
    );
};

export default BaseChatSender;