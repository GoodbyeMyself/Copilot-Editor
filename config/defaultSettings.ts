import { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
    pwa?: boolean;
    logo?: string;
} = {
    navTheme: 'light',
    // 拂晓蓝
    colorPrimary: '#1890ff',
    // 混合布局
    layout: 'mix',
    contentWidth: 'Fluid',
    fixedHeader: false,
    fixSiderbar: true,
    colorWeak: false,
    title: 'Copilot Editor',
    pwa: true,
    /**
     * @description: logo 可以访问本地文件, 也可以访问网络地址
     * @author: M.yunlong
     * @date: 2024-03-19 14:51:43
     */
    logo: 'https://raw.githubusercontent.com/GoodbyeMyself/SQL-Copilot/54485fdb28f9446e5dd106ba08a4b74eed641ac1/public/logo.svg',
    token: {
        // 参见ts声明，demo 见文档，通过 token 修改样式
        //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
    },
    // 关闭 prolayout 根据菜单和路径 自动匹配浏览器标题
    pageTitleRender: false,
    // 默认收起侧边栏
    defaultCollapsed: true,
    // 默认的菜单的收起和展开，会受到 breakpoint 的影响，breakpoint=false 生效 
    breakpoint: false,
};

export default Settings;
