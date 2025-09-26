// 自定义 icon
import { createFromIconfontCN } from '@ant-design/icons';

export default createFromIconfontCN({
    /**
     * @description: 加载本地 文件的方式
     * @author: M.yunlong
     * @date: 2024-03-24 23:26:57
     */
    scriptUrl: '/iconfont/iconfont.js',
    /**
     * @description: 给所有的 svg 图标 <Icon /> 组件设置额外的属性
     * @author: M.yunlong
     * @date: 2024-03-24 23:35:39
     */
    extraCommonProps: {
        style: {
            fontSize: '48px',
        },
    },
});
