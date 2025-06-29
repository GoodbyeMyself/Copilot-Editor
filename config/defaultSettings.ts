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
    title: 'SQL Copilot',
    pwa: true,
    /**
     * @description: logo 可以访问本地文件, 也可以访问网络地址
     * @author: M.yunlong
     * @date: 2024-03-19 14:51:43
     */
    logo: 'https://raw.githubusercontent.com/GoodbyeMyself/SQL-Copilot/1533641e93f0cfd02c2d3e4ff4e0757d1cb65aae/src/assets/images/logo.svg',
    token: {
        // 参见ts声明，demo 见文档，通过token 修改样式
        //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
    },
    // 关闭 prolayout 根据菜单和路径 自动匹配浏览器标题
    pageTitleRender: false,
};

export default Settings;
