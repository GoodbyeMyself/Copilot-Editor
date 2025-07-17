import { TreeDataNode } from "antd";
import { TreeDataSource, DataSourceTable, DataSourceField } from "@/types/files/dataset";
import { Database, Table, Type } from "lucide-react";
import React from "react";

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
    return sources.map(source => ({
        title: CustomTitleComponent ? React.createElement(CustomTitleComponent, {
            nodeKey: source.database.key,
        }, source.database.title) : source.database.title,
        key: source.database.key,
        icon: React.createElement(Database, { size: 16 }),
        children: convertTablesToAntdTree(source.database.tables, CustomTitleComponent),
    }));
}

/**
 * 根据节点 key 判断节点类型
 */
export function getNodeTypeFromKey(nodeKey: string): 'database' | 'table' | 'field' {
    const parts = nodeKey.split('-');
    if (parts.length === 1) {
        return 'database';
    } else if (parts.length === 2) {
        return 'table';
    } else {
        return 'field';
    }
} 