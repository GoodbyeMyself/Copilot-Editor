import { TreeDataNode } from "antd";
import { TreeDataSource, DataSourceTable, DataSourceField } from "@/types/files/dataset";
import { Table, Type } from "lucide-react";
import React from "react";
import SvgIcon from "@/components/common/SvgIcon";

// 数据源类型到图标的映射
const dataSourceTypeIconMap: Record<string, string> = {
    'MySQL': 'icon-mysql',
    'PostgreSQL': 'icon-pgsql',
    'Redis': 'icon-redis',
    'MongoDB': 'icon-MongoDB',
    'Oracle': 'icon-oracle',
    'SQLServer': 'icon-db_sqlserver',
    'MSSQL': 'icon-state-mssql',
    'Elasticsearch': 'icon-es',
    'Kafka': 'icon-alikafkaxiaoxiduilieKafka',
    'Kingbase': 'icon-kingbase',
    'Dameng': 'icon-dameng1-copy',
    'HTTP': 'icon-http',
    'ETL': 'icon-shujukuleixingETL',
    'Alipay': 'icon-zhifubao',
    // 默认图标
    'default': 'icon-shujuyuan'
};

/**
 * 根据数据源类型获取图标
 */
function getDataSourceIcon(dataSourceType?: string): React.ReactElement {
    const iconType = dataSourceType ? dataSourceTypeIconMap[dataSourceType] || dataSourceTypeIconMap['default'] : dataSourceTypeIconMap['default'];
    return React.createElement(SvgIcon, { 
        type: iconType, 
        style: {
            fontSize: '16px'
        }
    });
}

/**
 * 将字段数据转换为 Ant Design Tree 格式
 */
function convertFieldsToAntdTree(
    fields: DataSourceField[],
    CustomTitleComponent?: any
): TreeDataNode[] {
    return fields.map(field => ({
        title: CustomTitleComponent ? React.createElement(CustomTitleComponent, {
            nodeKey: field.key,
        }, field.title) : field.title,
        key: field.key,
        icon: React.createElement(Type, { size: 14 }),
        isLeaf: true,
    }));
}

/**
 * 将表数据转换为 Ant Design Tree 格式
 */
function convertTablesToAntdTree(
    tables: DataSourceTable[],
    CustomTitleComponent?: any
): TreeDataNode[] {
    return tables.map(table => ({
        title: CustomTitleComponent ? React.createElement(CustomTitleComponent, {
            nodeKey: table.key,
        }, table.title) : table.title,
        key: table.key,
        icon: React.createElement(Table, { size: 16 }),
        children: convertFieldsToAntdTree(table.fields, CustomTitleComponent),
    }));
}

/**
 * 将树形数据源转换为 Ant Design Tree 组件需要的格式
 */
export function convertTreeDataSourcesToAntdTree(
    sources: TreeDataSource[],
    CustomTitleComponent?: any
): TreeDataNode[] {
    return sources.map(source => {
        // 直接使用数据源中的 dataSourceType 参数
        const dataSourceType = source.database.dataSourceType;
        
        return {
            title: CustomTitleComponent ? React.createElement(CustomTitleComponent, {
                nodeKey: source.database.key,
            }, source.database.title) : source.database.title,
            key: source.database.key,
            icon: getDataSourceIcon(dataSourceType),
            children: convertTablesToAntdTree(source.database.tables, CustomTitleComponent),
        };
    });
}
