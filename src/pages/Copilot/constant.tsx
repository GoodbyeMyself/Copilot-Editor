import React from 'react';

import {
    AppstoreAddOutlined,
    CommentOutlined,
    FileSearchOutlined,
    HeartOutlined,
    PaperClipOutlined,
    ProductOutlined,
    ScheduleOutlined,
    SmileOutlined,
} from '@ant-design/icons';

import { type GetProp } from 'antd';

import { Prompts } from '@ant-design/x';

export const DEFAULT_CONVERSATIONS_ITEMS = [
    {
        key: 'default-0',
        label: '什么是 Ant Design X ?',
        group: 'Today',
    },
    {
        key: 'default-1',
        label: '如何快速安装和导入组件 ?',
        group: 'Today',
    },
    {
        key: 'default-2',
        label: '新型 AGI 混合接口',
        group: 'Yesterday',
    },
];

// HOT_TOPICS 需要作为函数导出，因为它依赖于样式类
export const getHotTopics = (styles: any) => ({
    key: '1',
    label: '热门话题',
    children: [
        {
            key: '1-1',
            description: 'Ant Design X 升级了什么 ?',
            icon: <span className={styles.hotTopicIcon1}>1</span>,
        },
        {
            key: '1-2',
            description: '新型 AGI 混合接口',
            icon: <span className={styles.hotTopicIcon2}>2</span>,
        },
        {
            key: '1-3',
            description: '探索人工智能时代的新设计范式.',
            icon: <span className={styles.hotTopicIcon4}>4</span>,
        },
        {
            key: '1-4',
            description: '如何快速安装和导入组件 ?',
            icon: <span className={styles.hotTopicIcon5}>5</span>,
        },
    ],
});

export const DESIGN_GUIDE = {
    key: '2',
    label: '设计指导',
    children: [
        {
            key: '2-1',
            icon: <HeartOutlined />,
            label: '意图',
            description: '人工智能理解用户需求并提供解决方案.',
        },
        {
            key: '2-2',
            icon: <SmileOutlined />,
            label: '角色',
            description: "人工智能的公众形象",
        },
        {
            key: '2-3',
            icon: <CommentOutlined />,
            label: '对话',
            description: '人工智能如何以用户理解的方式表达自己',
        },
        {
            key: '2-4',
            icon: <PaperClipOutlined />,
            label: '接口',
            description: 'AI平衡了 “聊天” 和 “如何做” 的行为.',
        },
    ],
};

export const SENDER_PROMPTS: GetProp<typeof Prompts, 'items'> = [
    {
        key: '1',
        description: '升级',
        icon: <ScheduleOutlined />,
    },
    {
        key: '2',
        description: '组件',
        icon: <ProductOutlined />,
    }
];