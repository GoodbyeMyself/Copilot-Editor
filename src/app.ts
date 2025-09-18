import React from 'react';
import { setupGlobalErrorHandling, setupResizeObserverErrorHandling } from '@/utils/errorHandling';
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

// 导入必要的 Provider
import { SessionProvider } from '@/context/session/provider';
// 移除查询提供者
import { EditorProvider } from '@/context/editor/provider';
import { EditorSettingsProvider } from '@/context/editor-settings/provider';

// TS 方法实现过滤 React 和 Antd 常见控制台警告
setupGlobalErrorHandling();
// 设置 ResizeObserver 错误处理
setupResizeObserverErrorHandling();

// --- 构建信息：仅在首次加载时输出一次，并暴露到 window ---
(() => {
    const buildInfo = {
        time: process.env.__BUILD_TIME__ || '',
        branch: process.env.__GIT_BRANCH__ || '',
        commitHash: process.env.__GIT_COMMIT_HASH__ || '',
        commitDate: process.env.__GIT_COMMIT_DATE__ || '',
    } as const;

    (window as any).__BUILD_INFO__ = buildInfo;

    const printedFlag = '__BUILD_INFO_PRINTED__';

    if (!(window as any)[printedFlag]) {
        // 只打印一次
        (window as any)[printedFlag] = true;
        // eslint-disable-next-line no-console
        console.table(buildInfo);
    }
})();

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
            React.createElement(EditorProvider, null,
                React.createElement(EditorSettingsProvider, null,
                    container
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
            return 'Copilot Editor';
        },
        // 头部右上角内容渲染
        rightContentRender: () => {
            return null;
        },
        // 全局
        ...initialState?.settings,
        /**
         * @description: 设置 iconfont: 线上的配置方式
         * @author: M.yunlong
         * @date: 2024-03-24 23:26:22
         */
        iconfontUrl: '//at.alicdn.com/t/c/font_4962060_a2hjfcpbz56.js'
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
