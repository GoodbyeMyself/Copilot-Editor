import { OpenAIFilled } from '@ant-design/icons';
import type { Conversation } from '@ant-design/x/es/conversations';
import React from 'react';

export const MOCK_SESSION_LIST: Conversation[] = [
    {
        key: '5',
        label: '新会话',
        group: 'Today',
    },
    {
        key: '4',
        label: 'Ant Design X 升级了什么 ?',
        group: 'Today',
    },
    {
        key: '3',
        label: '新型 AGI 混合接口',
        group: 'Today',
    },
    {
        key: '2',
        label: '如何快速安装和导入组件 ?',
        group: 'Yesterday',
    },
    {
        key: '1',
        label: '什么是 Ant Design X ?',
        group: 'Yesterday',
    },
];

export const MOCK_SUGGESTIONS = [
    {
        label: 'Write a report',
        value: 'report'
    },
    {
        label: 'Draw a picture',
        value: 'draw'
    },
    {
        label: 'Check some knowledge',
        value: 'knowledge',
        icon: React.createElement(OpenAIFilled),
        children: [
            {
                label: 'About React',
                value: 'react'
            },
            {
                label: 'About Ant Design',
                value: 'antd'
            },
        ],
    },
];

export const MOCK_QUESTIONS = [
    '快速生成高质量代码，提升开发效率 ！',
    '深入解释代码逻辑，轻松理解复杂程序 ！',
    '智能查找数据表，快速定位所需信息 ！',
];

export const AGENT_PLACEHOLDER = 'Generating content, please wait...'; 