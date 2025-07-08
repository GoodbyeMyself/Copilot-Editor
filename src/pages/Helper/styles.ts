import { createStyles } from 'antd-style';

export const useCopilotStyle = createStyles(({ token, css }) => {
    return {
        copilotChat: css`
            display: flex;
            flex-direction: column;
            background: ${token.colorBgContainer};
            color: ${token.colorText};
        `,
        // chatHeader 样式
        chatHeader: css`
            height: 52px;
            box-sizing: border-box;
            border-bottom: 1px solid ${token.colorBorder};
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px 0 16px;
        `,
        headerTitle: css`
            font-weight: 600;
            font-size: 15px;
        `,
        headerButton: css`
            font-size: 18px;
        `,
        conversations: css`
            width: 300px;
            .ant-conversations-list {
                padding-inline-start: 0;
            }
        `,
        // chatList 样式
        chatList: css`
            overflow: auto;
            padding-block: 16px;
            flex: 1;
        `,
        loadingMessage: css`
            background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
            background-size: 100% 2px;
            background-repeat: no-repeat;
            background-position: bottom;
        `,
        // chatSend 样式
        chatSend: css`
            padding: 12px;
        `,
        sendAction: css`
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            gap: 8px;
        `,
        speechButton: css`
            font-size: 18px;
            color: ${token.colorText} !important;
        `,
        // 新增的 header 样式
        assistantHeader: css`
            font-size: 12px;
            color: #666;
            margin: 5px 0;
            font-weight: 500;
        `,
        userHeader: css`
            font-size: 12px;
            color: #666;
            margin: 5px 0;
            font-weight: 500;
            text-align: right;
        `,
    };
});

export const useWorkareaStyle = createStyles(({ token, css }) => {
    return {
        copilotWrapper: css`
            min-width: 1000px;
            height: 80vh;
            display: flex;
            overflow: hidden;
        `,
        workarea: css`
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #eee;
        `,
        workareaHeader: css`
            box-sizing: border-box;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 48px 0 28px;
            border-bottom: 1px solid ${token.colorBorder};
        `,
        headerTitle: css`
            font-weight: 600;
            font-size: 15px;
            color: ${token.colorText};
            display: flex;
            align-items: center;
            gap: 8px;
        `,
        headerButton: css`
            background-image: linear-gradient(78deg, #8054f2 7%, #3895da 95%);
            border-radius: 12px;
            height: 24px;
            width: 93px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.3s;
            &:hover {
                opacity: 0.8;
            }
        `,
        workareaBody: css`
            flex: 1;
            padding: 16px;
            background: ${token.colorBgContainer};
            border-radius: 16px;
            min-height: 0;
        `,
        bodyContent: css`
            overflow: auto;
            height: 100%;
            padding-right: 10px;
        `,
        bodyText: css`
            color: ${token.colorText};
            padding: 8px;
        `,
    };
}); 