import React from 'react';

import { BaseChatList } from '../../../components/shared/chat';
import { MOCK_QUESTIONS } from '@/layouts/Copilot/constants';

interface ChatListProps {
    messages: any[];
    onUserSubmit?: (val: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({
    messages,
    onUserSubmit,
}) => {
    return (
        <BaseChatList
            messages={messages}
            onUserSubmit={onUserSubmit}
            containerClassName="helper-chat-list"
            messageClassName="helper-message-content"
            loadingMessageClassName="helper-loading-message"
            cancelledLabelClassName="helper-cancelled-label"
            assistantHeaderClassName="helper-assistant-header"
            userHeaderClassName="helper-user-header"
            bubbleStyle={{ height: '100%' }}
            bubblePadding="16px"
            welcomeTitle="Hi! I'm Copilot 智能助手"
            welcomeDescription="基于 AI 打造更智能的数据查询与分析体验 ~"
            promptsTitle="我可以帮助您："
            promptsItems={MOCK_QUESTIONS.map((i) => ({ key: i, description: i }))}
        />
    );
};

export default ChatList; 