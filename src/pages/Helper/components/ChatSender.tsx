import {
    AppstoreAddOutlined,
    PaperClipOutlined,
    ProductOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';

import {
    Sender,
    Suggestion,
} from '@ant-design/x';

import { Button } from 'antd';

import React from 'react';

import { MOCK_SUGGESTIONS } from '../constants';
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
}) => {
    return (
        <div className="helper-chat-send">
            <div className="helper-send-action">
                <Button
                    icon={<ScheduleOutlined />}
                    onClick={() => onUserSubmit('What has Ant Design X upgraded?')}
                >
                    Upgrades
                </Button>
                <Button
                    icon={<ProductOutlined />}
                    onClick={() => onUserSubmit('What component assets are available in Ant Design X?')}
                >
                    Components
                </Button>
                <Button icon={<AppstoreAddOutlined />}>More</Button>
            </div>

            {/** 输入框 */}
            <Suggestion items={MOCK_SUGGESTIONS} onSelect={(itemVal) => onInputValueChange(`[${itemVal}]:`)}>
                {({ onTrigger, onKeyDown }) => (
                    <Sender
                        loading={loading}
                        value={inputValue}
                        onChange={(v) => {
                            onTrigger(v === '/');
                            onInputValueChange(v);
                        }}
                        onSubmit={() => {
                            onUserSubmit(inputValue);
                            onInputValueChange('');
                        }}
                        onCancel={() => {
                            onAbort();
                        }}
                        allowSpeech
                        placeholder="Ask or input / use skills"
                        onKeyDown={onKeyDown}
                        header={<SendHeader {...sendHeaderProps} />}
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <SpeechButton className="helper-speech-button" />
                                    {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                                </div>
                            );
                        }}
                    />
                )}
            </Suggestion>
        </div>
    );
};

export default ChatSender; 