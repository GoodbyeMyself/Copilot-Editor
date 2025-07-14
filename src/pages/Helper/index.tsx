import { PageContainer } from '@ant-design/pro-components';

import {
    Attachments,
    type AttachmentsProps,
    useXAgent,
    useXChat,
} from '@ant-design/x';

import type { Conversation } from '@ant-design/x/es/conversations';

import { GetProp, GetRef } from 'antd';

import React, { useEffect, useRef, useState } from 'react';

import './styles.css';
import { MOCK_SESSION_LIST } from './constants';
import { ChatHeader, ChatList, ChatSender } from './components';

type BubbleDataType = {
    role: string;
    content: string;
};

interface CopilotProps {
    copilotOpen: boolean;
    setCopilotOpen: (open: boolean) => void;
}

const Copilot = (props: CopilotProps) => {
    const { copilotOpen, setCopilotOpen } = props;
    const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
    const abortController = useRef<AbortController | null>(null);

    // ==================== State ====================

    const [messageHistory, setMessageHistory] = useState<Record<string, any>>({});

    const [sessionList, setSessionList] = useState<Conversation[]>(MOCK_SESSION_LIST);
    const [curSession, setCurSession] = useState(sessionList[0].key);

    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    const [files, setFiles] = useState<GetProp<AttachmentsProps, 'items'>>([]);

    const [inputValue, setInputValue] = useState('');

    // 保存AI已经输出的内容
    const currentAIContent = useRef<string>('');

    /**
     * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
     */

    // ==================== Runtime ====================

    const [agent] = useXAgent<BubbleDataType>({
        baseURL: 'https://api.x.ant.design/api/llm_siliconflow_deepSeek-r1-distill-1wen-7b',
        model: 'DeepSeek-R1-Distill-Qwen-7B',
        dangerouslyApiKey: 'Bearer sk-xxxxxxxxxxxxxxxxxxxx',
    });

    const loading = agent.isRequesting();

    const { messages, onRequest, setMessages } = useXChat({
        agent,
        requestFallback: (_, { error }) => {
            if (error.name === 'AbortError') {
                // 获取AI已经输出的内容（originMessage的content）
                const existingContent = currentAIContent.current || '';
                const cancelledContent = existingContent 
                    ? `${existingContent}\n\n --- [请求已取消] ---`
                    : '请求已取消';
                
                return {
                    content: cancelledContent,
                    role: 'assistant',
                };
            }
            return {
                content: 'Request failed, please try again!',
                role: 'assistant',
            };
        },
        transformMessage: (info) => {
            const { originMessage, chunk } = info || {};
            
            // 保存AI已经输出的内容
            currentAIContent.current = originMessage?.content || '';
            
            let currentContent = '';
            let currentThink = '';
            try {
                if (chunk?.data && !chunk?.data.includes('DONE')) {
                    const message = JSON.parse(chunk?.data);
                    currentThink = message?.choices?.[0]?.delta?.reasoning_content || '';
                    currentContent = message?.choices?.[0]?.delta?.content || '';
                }
            } catch (error) {
                console.error(error);
            }

            let content = '';

            if (!originMessage?.content && currentThink) {
                content = `<think>${currentThink}`;
            } else if (
                originMessage?.content?.includes('<think>') &&
                !originMessage?.content.includes('</think>') &&
                currentContent
            ) {
                content = `${originMessage?.content}</think>${currentContent}`;
            } else {
                content = `${originMessage?.content || ''}${currentThink}${currentContent}`;
            }

            return {
                content: content,
                role: 'assistant',
            };
        },
        resolveAbortController: (controller) => {
            abortController.current = controller;
        },
    });

    // ==================== Event ====================
    const handleUserSubmit = (val: string) => {
        onRequest({
            stream: true,
            message: { content: val, role: 'user' },
        });

        // session title mock
        if (sessionList.find((i) => i.key === curSession)?.label === 'New session') {
            setSessionList(
                sessionList.map((i) => (i.key !== curSession ? i : { ...i, label: val?.slice(0, 20) })),
            );
        }
    };

    const onPasteFile = (_: File, files: FileList) => {
        for (const file of files) {
            attachmentsRef.current?.upload(file);
        }
        setAttachmentsOpen(true);
    };

    // 准备传递给子组件的 props
    const chatHeaderProps = {
        sessionList,
        curSession,
        messages,
        isRequesting: agent.isRequesting(),
        onSetCopilotOpen: setCopilotOpen,
        onSetSessionList: setSessionList,
        onSetCurSession: setCurSession,
        onSetMessages: setMessages,
        onAbort: () => abortController.current?.abort(),
        messageHistory,
    };

    const chatListProps = {
        messages,
        onUserSubmit: handleUserSubmit,
    };

    const sendHeaderProps = {
        attachmentsOpen,
        onAttachmentsOpenChange: setAttachmentsOpen,
        attachmentsRef,
        files,
        onFilesChange: setFiles,
    };

    const chatSenderProps = {
        inputValue,
        loading,
        attachmentsOpen,
        sendHeaderProps,
        onInputValueChange: setInputValue,
        onUserSubmit: handleUserSubmit,
        onAttachmentsOpenChange: setAttachmentsOpen,
        onAbort: () => abortController.current?.abort(),
        onPasteFile,
    };

    useEffect(() => {
        // history mock
        if (messages?.length) {
            setMessageHistory((prev) => ({
                ...prev,
                [curSession]: messages,
            }));
        }
    }, [messages]);

    return (
        <div className="helper-copilot-chat" style={{ width: copilotOpen ? 400 : 0 }}>
            {/** 对话区 - header */}
            <ChatHeader {...chatHeaderProps} />

            {/** 对话区 - 消息列表 */}
            <ChatList {...chatListProps} />

            {/** 对话区 - 输入框 */}
            <ChatSender {...chatSenderProps} />
        </div>
    );
};

const AccessPage: React.FC = () => {

    // ==================== State =================
    const [copilotOpen, setCopilotOpen] = useState(true);

    return (
        <PageContainer
            ghost
        >
            <div className="helper-copilot-wrapper">
                {/** 左侧工作区 */}
                <div className="helper-workarea">
                    <div className="helper-workarea-header">
                        <div className="helper-workarea-header-title">
                            <img
                                src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                                draggable={false}
                                alt="logo"
                                width={20}
                                height={20}
                            />
                            助手式 Copilot
                        </div>
                        {!copilotOpen && (
                            <div onClick={() => setCopilotOpen(true)} className="helper-workarea-header-button">
                                ✨ AI Copilot
                            </div>
                        )}
                    </div>

                    <div
                        className="helper-workarea-body"
                        style={{ margin: copilotOpen ? 16 : '16px 48px' }}
                    >
                        <div className="helper-body-content">
                            业务区域
                        </div>
                    </div>
                </div>

                {/** 右侧对话区 */}
                <Copilot copilotOpen={copilotOpen} setCopilotOpen={setCopilotOpen} />
            </div>
        </PageContainer>
    );
};

export default AccessPage;
