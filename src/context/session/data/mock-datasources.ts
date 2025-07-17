import { type TreeDataSource, type DataSourceDatabase } from "@/types/files/dataset";

// 模拟数据源数据
const mockDatabases: DataSourceDatabase[] = [
    {
        key: 'db1',
        title: '用户数据库',
        type: 'database',
        connectionString: 'postgresql://localhost:5432/userdb',
        tables: [
            {
                key: 'db1-users',
                title: '用户表',
                type: 'table',
                fields: [
                    {
                        key: 'db1-users-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'db1-users-username',
                        title: 'username',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                    {
                        key: 'db1-users-email',
                        title: 'email',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                    {
                        key: 'db1-users-created_at',
                        title: 'created_at',
                        type: 'field',
                        dataType: 'TIMESTAMP',
                    },
                ],
            },
            {
                key: 'db1-orders',
                title: '订单表',
                type: 'table',
                fields: [
                    {
                        key: 'db1-orders-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'db1-orders-user_id',
                        title: 'user_id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'db1-orders-amount',
                        title: 'amount',
                        type: 'field',
                        dataType: 'DECIMAL(10,2)',
                    },
                    {
                        key: 'db1-orders-status',
                        title: 'status',
                        type: 'field',
                        dataType: 'VARCHAR(50)',
                    },
                ],
            },
        ],
    },
    {
        key: 'db2',
        title: '产品数据库',
        type: 'database',
        connectionString: 'postgresql://localhost:5432/productdb',
        tables: [
            {
                key: 'db2-products',
                title: '产品表',
                type: 'table',
                fields: [
                    {
                        key: 'db2-products-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'db2-products-name',
                        title: 'name',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                    {
                        key: 'db2-products-price',
                        title: 'price',
                        type: 'field',
                        dataType: 'DECIMAL(10,2)',
                    },
                    {
                        key: 'db2-products-description',
                        title: 'description',
                        type: 'field',
                        dataType: 'TEXT',
                    },
                ],
            },
            {
                key: 'db2-categories',
                title: '分类表',
                type: 'table',
                fields: [
                    {
                        key: 'db2-categories-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'db2-categories-name',
                        title: 'name',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                    {
                        key: 'db2-categories-parent_id',
                        title: 'parent_id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                ],
            },
        ],
    },
    {
        key: 'db3',
        title: '日志数据库',
        type: 'database',
        connectionString: 'postgresql://localhost:5432/logdb',
        tables: [
            {
                key: 'db3-access_logs',
                title: '访问日志表',
                type: 'table',
                fields: [
                    {
                        key: 'db3-access_logs-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'db3-access_logs-user_id',
                        title: 'user_id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'db3-access_logs-ip_address',
                        title: 'ip_address',
                        type: 'field',
                        dataType: 'INET',
                    },
                    {
                        key: 'db3-access_logs-timestamp',
                        title: 'timestamp',
                        type: 'field',
                        dataType: 'TIMESTAMP',
                    },
                    {
                        key: 'db3-access_logs-action',
                        title: 'action',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                ],
            },
        ],
    },
];

// 将数据库转换为树形数据源格式
export const mockTreeDataSources: TreeDataSource[] = mockDatabases.map((db) => ({
    kind: "TREE_DATASET",
    id: db.key,
    path: db.key,
    database: db,
})); 