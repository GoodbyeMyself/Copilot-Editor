import {
    Attachments,
    type AttachmentsProps,
    useXAgent,
    useXChat,
} from '@ant-design/x';

import type { Conversation } from '@ant-design/x/es/conversations';

import { GetProp, GetRef } from 'antd';

import React, { useEffect, useRef, useState } from 'react';

import { ChatHeader, ChatList, ChatSender } from './index';
import { MOCK_SESSION_LIST } from '@/layouts/Copilot/constants';
import { 
    saveSessionList, 
    loadSessionList, 
    saveMessageHistory, 
    loadMessageHistory, 
    saveCurrentSession, 
    loadCurrentSession 
} from '../utils/storage';
import type { SessionEndReason, SessionEndEventData, SessionEndHandler } from '@/types/session';

type BubbleDataType = {
    role: string;
    content: string;
};

interface CopilotProps {
    setCopilotOpen: (open: boolean) => void;
    onCollapsePanel?: () => void;
    onSessionEnd?: SessionEndHandler;
}

const Copilot = (props: CopilotProps) => {
    const { setCopilotOpen, onCollapsePanel, onSessionEnd } = props;
    const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
    const abortController = useRef<AbortController | null>(null);

    // ==================== State ====================

    const [messageHistory, setMessageHistory] = useState<Record<string, any>>({});

    // 初始化时从localStorage加载数据
    const [sessionList, setSessionList] = useState<Conversation[]>(() => {
        const savedSessions = loadSessionList();
        return savedSessions && savedSessions.length > 0 ? savedSessions : MOCK_SESSION_LIST;
    });
    
    const [curSession, setCurSession] = useState(() => {
        const savedCurrentSession = loadCurrentSession();
        const initialSessionList = loadSessionList() || MOCK_SESSION_LIST;
        // 确保当前会话在会话列表中存在
        if (savedCurrentSession && initialSessionList.some(session => session.key === savedCurrentSession)) {
            return savedCurrentSession;
        }
        return initialSessionList[0]?.key || '';
    });

    // 添加初始化完成状态
    const [isInitialized, setIsInitialized] = useState(false);

    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    const [files, setFiles] = useState<GetProp<AttachmentsProps, 'items'>>([]);

    const [inputValue, setInputValue] = useState('');

    // 保存AI已经输出的内容
    const currentAIContent = useRef<string>('');
    // 当前这轮 assistant 消息的稳定 id（贯穿流式与取消）
    const currentAssistantId = useRef<string>('');
    // 本轮 <think> 开始时间戳（毫秒）
    const currentThinkStartAt = useRef<number | null>(null);
    // 本轮思考用时（秒），在正常闭合或取消时计算
    const currentThinkDurationSec = useRef<number | null>(null);

    const generateStableId = () => {
        try {
            // 优先使用原生 uuid（若可用）
            // @ts-ignore
            if (typeof crypto !== 'undefined' && crypto?.randomUUID) {
                // @ts-ignore
                return crypto.randomUUID();
            }
        } catch {}
        return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    };

    // 触发会话结束事件
    const triggerSessionEnd = (reason: SessionEndReason, sessionId?: string, sessionMessages?: any[]) => {
        if (onSessionEnd) {
            const currentSessionId = sessionId || curSession;
            const currentMessages = sessionMessages || [];
            const lastMessage = currentMessages.length > 0 ? currentMessages[currentMessages.length - 1] : undefined;
            
            const eventData: SessionEndEventData = {
                sessionId: currentSessionId,
                reason,
                messageCount: currentMessages.length,
                lastMessage,
                timestamp: Date.now(),
            };
            
            onSessionEnd(eventData);
        }
    };

    /**
     * 🔔 Please replace the BASE_URL, PATH, MODEL, API_KEY with your own values.
     */

    // ==================== Runtime ====================

    useEffect(() => {
        const originalFetch = window.fetch;
        
        // 创建一个拦截器来添加自定义请求头
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
            const customInit = {
                ...init,
                headers: {
                    ...init?.headers,
                    // 🔥 在这里添加你的自定义请求头
                    'X-Custom-Header': 'your-custom-value'
                }
            };
            return originalFetch(input, customInit);
        };
        
        // 组件卸载时恢复原始 fetch
        return () => {
            window.fetch = originalFetch;
        };
    }, [curSession]); // 依赖 curSession，当会话变化时重新设置


    const [agent] = useXAgent<BubbleDataType>({
        baseURL: 'https://api.deepseek.com/chat/completions',
        model: 'deepseek-reasoner',
        dangerouslyApiKey: 'Bearer sk-6a18e966275e47818f06d0a3238278b1',
    });

    const loading = agent.isRequesting();

    const { messages, onRequest, setMessages } = useXChat({
        agent,
        requestFallback: (_, { error }) => {
            if (error?.name === 'AbortError') {
                // 触发会话结束事件 - 手动终止
                // 注意：这里还无法获取到最新的 messages，所以暂时传空数组
                triggerSessionEnd('aborted', undefined, []);
                
                // 获取AI已经输出的内容（originMessage的content）
                const existingContent = currentAIContent.current || '';
                // 如果存在未闭合的 <think>，在取消时补齐闭合以触发用时结算
                const hasOpenThink = existingContent.includes('<think>') && !existingContent.includes('</think>');
                const normalized = hasOpenThink ? `${existingContent}</think>` : existingContent;
                const cancelledContent = normalized
                    ? `${normalized} --- [请求已取消] ---`
                    : '请求已取消';
                // 优先使用已经固定的思考时间，避免包含响应时间
                const durationSec = currentThinkDurationSec.current !== null
                    ? currentThinkDurationSec.current
                    : (currentThinkStartAt.current
                        ? Math.max(0, Math.round((Date.now() - currentThinkStartAt.current) / 1000))
                        : 0);
                
                return {
                    id: currentAssistantId.current,
                    content: cancelledContent,
                    role: 'assistant',
                    meta: {
                        thinkStartAt: currentThinkStartAt.current ?? undefined,
                        durationSec,
                    },
                };
            }
            return {
                id: currentAssistantId.current,
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
                if (!currentThinkStartAt.current) {
                    currentThinkStartAt.current = Date.now();
                }
            } else if (
                originMessage?.content?.includes('<think>') &&
                !originMessage?.content.includes('</think>') &&
                currentContent
            ) {
                content = `${originMessage?.content}</think>${currentContent}`;
                // 正常闭合时结算一次用时（秒）
                if (currentThinkStartAt.current && currentThinkDurationSec.current === null) {
                    currentThinkDurationSec.current = Math.max(
                        0,
                        Math.round((Date.now() - currentThinkStartAt.current) / 1000),
                    );
                }
            } else {
                content = `${originMessage?.content || ''}${currentThink}${currentContent}`;
            }

            return {
                id: currentAssistantId.current,
                content: content,
                role: 'assistant',
                meta:
                    currentThinkStartAt.current || currentThinkDurationSec.current !== null
                        ? {
                              thinkStartAt: currentThinkStartAt.current ?? undefined,
                              durationSec:
                                  currentThinkDurationSec.current !== null
                                      ? currentThinkDurationSec.current
                                      : undefined,
                          }
                        : undefined,
            };
        },
        resolveAbortController: (controller) => {
            abortController.current = controller;
        },
    });

    // 追踪请求状态变化，用于检测正常完成
    const prevLoadingRef = useRef(loading);
    
    useEffect(() => {
        // 当从 loading 状态变为非 loading 状态时，表示请求正常完成
        if (prevLoadingRef.current && !loading) {
            // 延迟一点时间确保消息已经更新
            setTimeout(() => {
                triggerSessionEnd('completed', undefined, messages);
            }, 100);
        }
        prevLoadingRef.current = loading;
    }, [loading, messages]);

    // ==================== 页面刷新清理逻辑 ====================
    useEffect(() => {
        // 页面刷新或关闭时的清理函数
        const handleBeforeUnload = () => {
            // 如果有正在进行的请求，尝试中止它
            if (abortController.current) {
                try {
                    abortController.current.abort('页面刷新');
                } catch (error) {
                    console.warn('页面刷新时中止请求失败:', error);
                }
            }
        };

        // 组件卸载时的清理函数
        const handleUnload = () => {
            if (abortController.current) {
                try {
                    abortController.current.abort('组件卸载');
                } catch (error) {
                    console.warn('组件卸载时中止请求失败:', error);
                }
            }
        };

        // 添加页面刷新/关闭事件监听器
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

        // 清理函数
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
            
            // 组件卸载时触发会话结束事件
            triggerSessionEnd('unmounted', curSession, messages);
            
            // 组件卸载时也要中止请求
            if (abortController.current) {
                try {
                    abortController.current.abort('组件卸载');
                } catch (error) {
                    console.warn('组件卸载时中止请求失败:', error);
                }
            }
        };
    }, []);

    // ==================== Event ====================
    const handleUserSubmit = (val: string) => {
        // 为本轮 assistant 输出生成稳定 id，并重置思考开始时间/用时
        currentAssistantId.current = generateStableId();
        currentThinkStartAt.current = null;
        currentThinkDurationSec.current = null;

        onRequest({
            stream: true,
            message: {
                content: val,
                role: 'user'
            },
            // 🆕 添加自定义参数
            testParams: 'custom-params',
            // 🆕 添加元数据
            metadata: {
                userId: 'user-123',
                sessionId: curSession,
                timestamp: Date.now(),
                source: 'copilot-chat',
            }
        });

        // session title mock
        if (sessionList.find((i) => i.key === curSession)?.label === 'New session') {
            const updatedSessionList = sessionList.map((i) => 
                i.key !== curSession ? i : { ...i, label: val?.slice(0, 20) }
            );
            setSessionList(updatedSessionList);
            // 保存到localStorage
            saveSessionList(updatedSessionList);
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
        onSetSessionList: (newSessionList: Conversation[]) => {
            setSessionList(newSessionList);
            // 保存到localStorage
            saveSessionList(newSessionList);
        },
        onSetCurSession: (newSession: string) => {
            // 如果切换到不同会话，触发当前会话结束事件
            if (curSession && newSession !== curSession) {
                triggerSessionEnd('switched', curSession, messages);
            }
            
            setCurSession(newSession);
            // 保存到localStorage
            saveCurrentSession(newSession);
            // 恢复该会话的历史消息
            const sessionHistory = messageHistory[newSession] || [];
            setMessages(sessionHistory);
        },
        onSetMessages: setMessages,
        onAbort: () => abortController.current?.abort(),
        onDeleteSession: (sessionId: string) => {
            // 获取要删除会话的消息历史
            const sessionMessages = messageHistory[sessionId] || [];
            
            // 触发会话删除结束事件
            triggerSessionEnd('deleted', sessionId, sessionMessages);
            
            // 从消息历史中删除对应的会话记录
            const updatedHistory = { ...messageHistory };
            delete updatedHistory[sessionId];
            setMessageHistory(updatedHistory);
            // 保存到localStorage
            saveMessageHistory(updatedHistory);
        },
        onCollapsePanel,
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
        attachedFiles: files,
        onAttachedFilesChange: setFiles,
    };

    // 组件初始化时加载历史数据
    useEffect(() => {
        const initializeData = async () => {
            // 加载消息历史记录
            const savedMessageHistory = loadMessageHistory();
            setMessageHistory(savedMessageHistory);
            
            // 如果当前会话有历史消息，则恢复它们
            if (savedMessageHistory[curSession] && savedMessageHistory[curSession].length > 0) {
                setMessages(savedMessageHistory[curSession]);
            }
            
            // 标记初始化完成
            setIsInitialized(true);
        };

        initializeData();
    }, []); // 只在组件挂载时执行一次

    // 监听messages变化，自动保存到localStorage
    useEffect(() => {
        // 只有在初始化完成后才保存，避免覆盖已加载的历史数据
        if (isInitialized && messages?.length) {
            const updatedHistory = {
                ...messageHistory,
                [curSession]: messages,
            };
            setMessageHistory(updatedHistory);
            // 保存到localStorage
            saveMessageHistory(updatedHistory);
        }
    }, [messages, curSession, isInitialized, messageHistory]);

    // 监听会话列表变化，自动保存到localStorage
    useEffect(() => {
        if (isInitialized) {
            saveSessionList(sessionList);
        }
    }, [sessionList, isInitialized]);

    // 监听当前会话变化，自动保存到localStorage
    useEffect(() => {
        if (isInitialized) {
            saveCurrentSession(curSession);
        }
    }, [curSession, isInitialized]);

    return (
        <div className="helper-copilot-chat">
            {/** 对话区 - header */}
            <ChatHeader {...chatHeaderProps} />

            {/** 对话区 - 消息列表 */}
            <ChatList {...chatListProps} />

            {/** 对话区 - 输入框 */}
            <ChatSender {...chatSenderProps} />
        </div>
    );
};

export default Copilot;