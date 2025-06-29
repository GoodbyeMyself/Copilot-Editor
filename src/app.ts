import { setupGlobalErrorHandling } from '@/utils/errorHandling';

// 系统默认配置
import defaultSettings from '../config/defaultSettings';

// pro-componets 组件
import type { Settings as LayoutSettings } from '@ant-design/pro-components';

// 运行时 配置
import type { RequestConfig } from '@umijs/max';

// request 请求拦截
import { errorConfig } from './server/requestErrorConfig';

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
        // 全局
        ...initialState?.settings
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
