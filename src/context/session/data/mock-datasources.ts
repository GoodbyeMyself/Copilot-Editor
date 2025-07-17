import { type TreeDataSource, type DataSourceDatabase } from "@/types/files/dataset";

// 模拟数据源数据
const mockDatabases: DataSourceDatabase[] = [
    {
        key: 'mysql-prod',
        title: 'MySQL 生产数据库',
        type: 'database',
        dataSourceType: 'MySQL',
        connectionString: 'mysql://prod-server:3306/database',
        tables: [
            {
                key: 'mysql-prod-users',
                title: '用户表',
                type: 'table',
                fields: [
                    {
                        key: 'mysql-prod-users-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'mysql-prod-users-username',
                        title: 'username',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                    {
                        key: 'mysql-prod-users-email',
                        title: 'email',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                    {
                        key: 'mysql-prod-users-created_at',
                        title: 'created_at',
                        type: 'field',
                        dataType: 'TIMESTAMP',
                    },
                ],
            },
            {
                key: 'mysql-prod-orders',
                title: '订单表',
                type: 'table',
                fields: [
                    {
                        key: 'mysql-prod-orders-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'mysql-prod-orders-user_id',
                        title: 'user_id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'mysql-prod-orders-amount',
                        title: 'amount',
                        type: 'field',
                        dataType: 'DECIMAL(10,2)',
                    },
                    {
                        key: 'mysql-prod-orders-status',
                        title: 'status',
                        type: 'field',
                        dataType: 'VARCHAR(50)',
                    },
                ],
            },
        ],
    },
    {
        key: 'postgresql-userdb',
        title: 'PostgreSQL 用户库',
        type: 'database',
        dataSourceType: 'PostgreSQL',
        connectionString: 'postgresql://user-db:5432/users',
        tables: [
            {
                key: 'postgresql-userdb-products',
                title: '产品表',
                type: 'table',
                fields: [
                    {
                        key: 'postgresql-userdb-products-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'postgresql-userdb-products-name',
                        title: 'name',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                    {
                        key: 'postgresql-userdb-products-price',
                        title: 'price',
                        type: 'field',
                        dataType: 'DECIMAL(10,2)',
                    },
                    {
                        key: 'postgresql-userdb-products-description',
                        title: 'description',
                        type: 'field',
                        dataType: 'TEXT',
                    },
                ],
            },
            {
                key: 'postgresql-userdb-categories',
                title: '分类表',
                type: 'table',
                fields: [
                    {
                        key: 'postgresql-userdb-categories-id',
                        title: 'id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                    {
                        key: 'postgresql-userdb-categories-name',
                        title: 'name',
                        type: 'field',
                        dataType: 'VARCHAR(255)',
                    },
                    {
                        key: 'postgresql-userdb-categories-parent_id',
                        title: 'parent_id',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                ],
            },
        ],
    },
    {
        key: 'redis-cache',
        title: 'Redis 缓存集群',
        type: 'database',
        dataSourceType: 'Redis',
        connectionString: 'redis://cache-cluster:6379',
        tables: [
            {
                key: 'redis-cache-sessions',
                title: '会话缓存',
                type: 'table',
                fields: [
                    {
                        key: 'redis-cache-sessions-key',
                        title: 'key',
                        type: 'field',
                        dataType: 'STRING',
                    },
                    {
                        key: 'redis-cache-sessions-value',
                        title: 'value',
                        type: 'field',
                        dataType: 'STRING',
                    },
                    {
                        key: 'redis-cache-sessions-expire',
                        title: 'expire',
                        type: 'field',
                        dataType: 'INTEGER',
                    },
                ],
            },
        ],
    },
    {
        key: 'mongodb-documents',
        title: 'MongoDB 文档库',
        type: 'database',
        dataSourceType: 'MongoDB',
        connectionString: 'mongodb://doc-server:27017/documents',
        tables: [
            {
                key: 'mongodb-documents-articles',
                title: '文章集合',
                type: 'table',
                fields: [
                    {
                        key: 'mongodb-documents-articles-_id',
                        title: '_id',
                        type: 'field',
                        dataType: 'ObjectId',
                    },
                    {
                        key: 'mongodb-documents-articles-title',
                        title: 'title',
                        type: 'field',
                        dataType: 'String',
                    },
                    {
                        key: 'mongodb-documents-articles-content',
                        title: 'content',
                        type: 'field',
                        dataType: 'String',
                    },
                    {
                        key: 'mongodb-documents-articles-author',
                        title: 'author',
                        type: 'field',
                        dataType: 'String',
                    },
                ],
            },
        ],
    },
    {
        key: 'oracle-enterprise',
        title: 'Oracle 企业库',
        type: 'database',
        dataSourceType: 'Oracle',
        connectionString: 'oracle://enterprise:1521/ORCL',
        tables: [
            {
                key: 'oracle-enterprise-employees',
                title: '员工表',
                type: 'table',
                fields: [
                    {
                        key: 'oracle-enterprise-employees-emp_id',
                        title: 'emp_id',
                        type: 'field',
                        dataType: 'NUMBER',
                    },
                    {
                        key: 'oracle-enterprise-employees-name',
                        title: 'name',
                        type: 'field',
                        dataType: 'VARCHAR2(100)',
                    },
                    {
                        key: 'oracle-enterprise-employees-salary',
                        title: 'salary',
                        type: 'field',
                        dataType: 'NUMBER(10,2)',
                    },
                    {
                        key: 'oracle-enterprise-employees-dept_id',
                        title: 'dept_id',
                        type: 'field',
                        dataType: 'NUMBER',
                    },
                ],
            },
        ],
    },
    {
        key: 'alipay-api',
        title: 'Alipay支付数据源',
        type: 'database',
        dataSourceType: 'Alipay',
        connectionString: 'https://openapi.alipay.com/gateway.do',
        tables: [
            {
                key: 'alipay-api-transactions',
                title: '交易记录',
                type: 'table',
                fields: [
                    {
                        key: 'alipay-api-transactions-trade_no',
                        title: 'trade_no',
                        type: 'field',
                        dataType: 'STRING',
                    },
                    {
                        key: 'alipay-api-transactions-amount',
                        title: 'amount',
                        type: 'field',
                        dataType: 'DECIMAL',
                    },
                    {
                        key: 'alipay-api-transactions-status',
                        title: 'status',
                        type: 'field',
                        dataType: 'STRING',
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