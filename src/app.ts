import React from 'react';
import { setupGlobalErrorHandling } from '@/utils/errorHandling';
import { App } from 'antd';

// 引入全局样式文件
import '@/assets/styles/index.less';

// 系统默认配置
import defaultSettings from '../config/defaultSettings';

// pro-componets 组件
import type { Settings as LayoutSettings } from '@ant-design/pro-components';

// 运行时 配置
import type { RequestConfig } from '@umijs/max';

// request 请求拦截
import { errorConfig } from './server/requestErrorConfig';

// 导入 query-toolbar 组件
import Toolbar from '@/components/query-toolbar';

// 导入必要的 Provider
import { SessionProvider } from '@/context/session/provider';
import { DbProvider } from '@/context/db/provider';
import { QueryProvider } from '@/context/query/provider';
import { EditorProvider } from '@/context/editor/provider';
import { EditorSettingsProvider } from '@/context/editor-settings/provider';

// TS 方法实现过滤 React 和 Antd 常见控制台警告
setupGlobalErrorHandling();

// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{
    name: string;
    settings?: Partial<LayoutSettings>;
}> {
    return {
        // --
        name: 'admin',
        // --
        settings: defaultSettings as Partial<LayoutSettings>,
    };
}

// 包装根容器，提供全局 Provider
export function rootContainer(container: React.ReactElement) {
    return React.createElement(
        App,
        {},
        React.createElement(SessionProvider, null,
            React.createElement(DbProvider, null,
                React.createElement(QueryProvider, null,
                    React.createElement(EditorProvider, null,
                        React.createElement(EditorSettingsProvider, null,
                            container
                        )
                    )
                )
            )
        )
    );
}

export const layout = ({
    initialState,
}: {
    initialState?: {
        name: string;
        settings?: Partial<LayoutSettings>;
    };
}) => {
    return {
        logo: 'https://raw.githubusercontent.com/GoodbyeMyself/SQL-Copilot/54485fdb28f9446e5dd106ba08a4b74eed641ac1/public/logo.svg',
        menu: {
            locale: false,
        },
        // 自定义 页面 title
        pageTitleRender: () => {
            return 'SQL Copilot';
        },
        // 头部右上角内容渲染
        rightContentRender: () => {
            return React.createElement(Toolbar);
        },
        // 全局
        ...initialState?.settings,
        /**
         * @description: 设置 iconfont: 线上的配置方式
         * @author: M.yunlong
         * @date: 2024-03-24 23:26:22
         */
        iconfontUrl: '//at.alicdn.com/t/c/font_4962060_f6pii5fcro.js'
    };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
    // 基础 路径
    baseURL: '',
    // 请求头
    headers: {
        'X-Requested-Test': 'test-header',
    },
    // 异常处理
    ...errorConfig
};
