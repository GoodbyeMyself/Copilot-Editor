import React from 'react';

import { PageContainer } from '@ant-design/pro-components';

import { type GetProp, message } from 'antd';

import {
    Attachments,
    useXAgent,
    useXChat,
} from '@ant-design/x';

import { useEffect, useRef, useState } from 'react';

import './styles.css';
// 定义常量
import { DEFAULT_CONVERSATIONS_ITEMS, DESIGN_GUIDE, SENDER_PROMPTS, getHotTopics } from './constant';
// 导入子组件
import { ChatSider, ChatList, SenderHeader, ChatSender } from './components';

type BubbleDataType = {
    role: string;
    content: string;
};

const AccessPage: React.FC = () => {
    const abortController = useRef<AbortController | null>(null);

    // 使用 CSS 类名获取 HOT_TOPICS 配置
    const HOT_TOPICS = getHotTopics({
        hotTopicIcon1: 'copilot-hot-topic-icon-1',
        hotTopicIcon2: 'copilot-hot-topic-icon-2',
        hotTopicIcon3: 'copilot-hot-topic-icon-3',
        hotTopicIcon4: 'copilot-hot-topic-icon-4',
        hotTopicIcon5: 'copilot-hot-topic-icon-5',
    });

    // ==================== State ====================
    const [messageHistory, setMessageHistory] = useState<Record<string, any>>({});

    const [conversations, setConversations] = useState(DEFAULT_CONVERSATIONS_ITEMS);
    const [curConversation, setCurConversation] = useState(DEFAULT_CONVERSATIONS_ITEMS[0].key);

    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);

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

    const { onRequest, messages, setMessages } = useXChat({
        agent,
        requestFallback: (currentMessage, { error }) => {

            console.log('currentMessage', currentMessage);

            if (error?.name === 'AbortError') {
                // 获取AI已经输出的内容（originMessage的content）
                const existingContent = currentAIContent.current || '';
                const cancelledContent = existingContent 
                    ? `${existingContent}\n\n *** [请求已取消] ***`
                    : '请求已取消';
                
                return {
                    content: cancelledContent,
                    role: 'assistant',
                };
            }
            return {
                content: '请求失败，请重试！',
                role: 'assistant',
            };
        },
        transformMessage: (info) => {

            console.log(info, '<- 打印 xxx');

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
                console.error('Transform message error:', error);
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
    const onSubmit = (val: string) => {
        if (!val) return;

        if (loading) {
            message.error('请求正在进行中，请等待请求完成。');
            return;
        }

        onRequest({
            stream: true,
            message: { role: 'user', content: val },
        });
    };

    // ==================== 组件渲染 ====================
    const senderHeader = (
        <SenderHeader
            attachmentsOpen={attachmentsOpen}
            attachedFiles={attachedFiles}
            onAttachmentsOpenChange={setAttachmentsOpen}
            onAttachedFilesChange={setAttachedFiles}
        />
    );

    useEffect(() => {
        // history mock
        if (messages?.length) {
            setMessageHistory((prev) => ({
                ...prev,
                [curConversation]: messages,
            }));
        }
    }, [messages]);

    return (
        <PageContainer
            ghost
        >
            <div className="copilot-layout">
                <ChatSider
                    conversations={conversations}
                    curConversation={curConversation}
                    messageHistory={messageHistory}
                    isRequesting={agent.isRequesting()}
                    abortController={abortController}
                    onConversationsChange={setConversations}
                    onCurConversationChange={setCurConversation}
                    onMessagesChange={setMessages}
                />

                <div className="copilot-chat">
                    <ChatList
                        messages={messages}
                        hotTopics={HOT_TOPICS}
                        designGuide={DESIGN_GUIDE}
                        onSubmit={onSubmit}
                    />
                    <ChatSender
                        senderPrompts={SENDER_PROMPTS}
                        inputValue={inputValue}
                        loading={loading}
                        senderHeader={senderHeader}
                        abortController={abortController}
                        onSubmit={onSubmit}
                        onInputChange={setInputValue}
                        onAttachmentsToggle={() => setAttachmentsOpen(!attachmentsOpen)}
                    />
                </div>
            </div>
        </PageContainer>
    );
};

export default AccessPage;
