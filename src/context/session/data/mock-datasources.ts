import { type TreeDataSource, type DataSourceDatabase } from "@/types/files/dataset";

// 数据源管理页面使用的数据结构
export interface DataSourceItem {
    id: number;
    name: string;
    type: string;
    icon: string;
    status: 'connected' | 'disconnected' | 'warning';
    url: string;
    version: string;
    description: string;
    // 树形数据源相关字段
    key: string;
    dataSourceType: string;
    connectionString: string;
    tables: any[];
}

// 模拟数据源数据 - 融合版本
export const mockDataSources: DataSourceItem[] = [
    {
        id: 1,
        name: 'MySQL 生产数据库',
        type: 'MySQL',
        icon: 'icon-mysql',
        status: 'connected',
        url: 'mysql://prod-server:3306/database',
        version: '8.0.32',
        description: '生产环境主数据库',
        key: 'mysql-prod',
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
        id: 2,
        name: 'PostgreSQL 用户库',
        type: 'PostgreSQL',
        icon: 'icon-pgsql',
        status: 'disconnected',
        url: 'postgresql://user-db:5432/users',
        version: '14.8',
        description: '用户数据存储库',
        key: 'postgresql-userdb',
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
        id: 3,
        name: 'Redis 缓存集群',
        type: 'Redis',
        icon: 'icon-redis',
        status: 'warning',
        url: 'redis://cache-cluster:6379',
        version: '7.0.11',
        description: '缓存数据库集群',
        key: 'redis-cache',
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
        id: 4,
        name: 'MongoDB 文档库',
        type: 'MongoDB',
        icon: 'icon-MongoDB',
        status: 'connected',
        url: 'mongodb://doc-server:27017/documents',
        version: '6.0.5',
        description: '文档存储数据库',
        key: 'mongodb-documents',
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
        id: 5,
        name: 'Oracle 企业库',
        type: 'Oracle',
        icon: 'icon-oracle',
        status: 'connected',
        url: 'oracle://enterprise:1521/ORCL',
        version: '19c',
        description: '企业级数据库',
        key: 'oracle-enterprise',
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
        id: 6,
        name: 'Alipay支付数据源',
        type: 'Alipay',
        icon: 'icon-zhifubao',
        status: 'connected',
        url: 'https://openapi.alipay.com/gateway.do',
        version: 'v3.0',
        description: '支付宝接口数据源',
        key: 'alipay-api',
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

// 将融合数据转换为树形数据源格式
export const mockTreeDataSources: TreeDataSource[] = mockDataSources.map((dataSource) => ({
    kind: "TREE_DATASET",
    id: dataSource.key,
    path: dataSource.key,
    database: {
        key: dataSource.key,
        title: dataSource.name,
        type: 'database',
        dataSourceType: dataSource.dataSourceType,
        connectionString: dataSource.connectionString,
        tables: dataSource.tables,
    } as DataSourceDatabase,
}));

// 将融合数据转换为管理页面格式
export const getDataSourceItems = (): DataSourceItem[] => {
    return mockDataSources;
};

// 添加新数据源的函数
export const addDataSource = (newDataSource: Omit<DataSourceItem, 'id'>): DataSourceItem => {
    const id = Math.max(...mockDataSources.map(ds => ds.id)) + 1;
    const dataSourceWithId: DataSourceItem = {
        ...newDataSource,
        id,
    };
    
    // 这里应该更新全局状态，而不是直接修改 mockDataSources
    // 实际实现中，这个函数会被集成到 SessionProvider 中
    return dataSourceWithId;
}; 