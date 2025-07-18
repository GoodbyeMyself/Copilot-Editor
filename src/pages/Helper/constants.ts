import { OpenAIFilled } from '@ant-design/icons';
import type { Conversation } from '@ant-design/x/es/conversations';
import React from 'react';

export const MOCK_SESSION_LIST: Conversation[] = [
    {
        key: '5',
        label: 'New session',
        group: 'Today',
    },
    {
        key: '4',
        label: 'What has Ant Design X upgraded?',
        group: 'Today',
    },
    {
        key: '3',
        label: 'New AGI Hybrid Interface',
        group: 'Today',
    },
    {
        key: '2',
        label: 'How to quickly install and import components?',
        group: 'Yesterday',
    },
    {
        key: '1',
        label: '什么是 Ant Design X ?',
        group: 'Yesterday',
    },
];

export const MOCK_SUGGESTIONS = [
    { label: 'Write a report', value: 'report' },
    { label: 'Draw a picture', value: 'draw' },
    {
        label: 'Check some knowledge',
        value: 'knowledge',
        icon: React.createElement(OpenAIFilled),
        children: [
            { label: 'About React', value: 'react' },
            { label: 'About Ant Design', value: 'antd' },
        ],
    },
];

export const MOCK_QUESTIONS = [
    'What has Ant Design X upgraded?',
    'What components are in Ant Design X?',
    'How to quickly install and import components?',
];

export const AGENT_PLACEHOLDER = 'Generating content, please wait...'; 