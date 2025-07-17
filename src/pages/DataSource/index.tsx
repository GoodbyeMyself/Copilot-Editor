import { PageContainer } from '@ant-design/pro-components';



import {
    Button,
    Card,
    Input,
    Space,
    Row,
    Col,
    Pagination,
    Badge,
    Avatar,
    Typography,
    Divider
} from 'antd';

import {
    PlusOutlined,
    DeleteOutlined,
    SearchOutlined,
    DatabaseOutlined,
    LinkOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';

// 自定义 svg 组件
import SvgIcon from '@/components/common/SvgIcon';

import { useState } from 'react';

const { Search } = Input;
const { Text, Title } = Typography;


// 模拟数据源数据
const mockDataSources = [
    {
        id: 1,
        name: 'MySQL 生产数据库',
        type: 'MySQL',
        icon: 'icon-mysql',
        status: 'connected',
        url: 'mysql://prod-server:3306/database',
        version: '8.0.32',
        description: '生产环境主数据库'
    },
    {
        id: 2,
        name: 'PostgreSQL 用户库',
        type: 'PostgreSQL',
        icon: 'icon-pgsql',
        status: 'disconnected',
        url: 'postgresql://user-db:5432/users',
        version: '14.8',
        description: '用户数据存储库'
    },
    {
        id: 3,
        name: 'Redis 缓存集群',
        type: 'Redis',
        icon: 'icon-redis',
        status: 'warning',
        url: 'redis://cache-cluster:6379',
        version: '7.0.11',
        description: '缓存数据库集群'
    },
    {
        id: 4,
        name: 'MongoDB 文档库',
        type: 'MongoDB',
        icon: 'icon-MongoDB',
        status: 'connected',
        url: 'mongodb://doc-server:27017/documents',
        version: '6.0.5',
        description: '文档存储数据库'
    },
    {
        id: 5,
        name: 'Oracle 企业库',
        type: 'Oracle',
        icon: 'icon-oracle',
        status: 'connected',
        url: 'oracle://enterprise:1521/ORCL',
        version: '19c',
        description: '企业级数据库'
    },
    {
        id: 6,
        name: 'Alipay支付数据源',
        type: 'Alipay',
        icon: 'icon-zhifubao',
        status: 'connected',
        url: 'https://openapi.alipay.com/gateway.do',
        version: 'v3.0',
        description: '支付宝接口数据源'
    }
];

const AccessPage: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(6);

    // 状态图标和颜色映射
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'connected':
                return {
                    icon: <CheckCircleOutlined />,
                    color: 'success',
                    text: '已连接'
                };
            case 'disconnected':
                return {
                    icon: <CloseCircleOutlined />,
                    color: 'error',
                    text: '连接失败'
                };
            case 'warning':
                return {
                    icon: <ExclamationCircleOutlined />,
                    color: 'warning',
                    text: '连接异常'
                };
            default:
                return {
                    icon: <CloseCircleOutlined />,
                    color: 'default',
                    text: '未知状态'
                };
        }
    };

    // 过滤数据源
    const filteredDataSources = mockDataSources.filter(item =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.type.toLowerCase().includes(searchValue.toLowerCase())
    );

    // 分页数据
    const paginatedData = filteredDataSources.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleAddDataSource = () => {
        console.log('新增数据源');
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, height: 'calc(100vh - 104px)' }}>
                {/* 操作按钮区域 */}
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddDataSource}
                        >
                            新增数据源
                        </Button>
                    </Space>
                </div>

                {/* 搜索区域 */}
                <div style={{ marginBottom: 24 }}>
                    <Search
                        placeholder="搜索数据源名称或类型"
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        onChange={(e) => setSearchValue(e.target.value)}
                        style={{ maxWidth: 400 }}
                    />
                </div>

                {/* 卡片列表区域 */}
                <Row gutter={[16, 16]}>
                    {paginatedData.map((dataSource) => {
                        const statusConfig = getStatusConfig(dataSource.status);
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} key={dataSource.id}>
                                <Card
                                    hoverable
                                    style={{ height: '100%' }}
                                    actions={[
                                        <LinkOutlined key="connect" />,
                                        <DatabaseOutlined key="test" />,
                                        <DeleteOutlined key="delete" />
                                    ]}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                        <Avatar
                                            size={48}
                                            style={{ marginRight: 12, border: '1px solid #f0f0f0', backgroundColor: '#f8f8f8' }}
                                            icon={<SvgIcon type={dataSource.icon} style={{ fontSize: '24px' }}/>}
                                        >
                                        </Avatar>
                                        <div style={{ flex: 1 }}>
                                            <Title level={5} style={{ margin: 0, fontSize: '14px', marginBottom: 4 }}>
                                                {dataSource.name}
                                            </Title>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {dataSource.description}
                                            </Text>
                                        </div>
                                    </div>

                                    <Divider style={{ margin: '8px 0' }} />

                                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: '12px' }}>
                                                连接状态 :
                                            </Text>
                                            <Badge
                                                status={statusConfig.color as any}
                                                text={<span style={{ fontSize: '11px' }}>{statusConfig.text}</span>}
                                            />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: '12px' }}>
                                                数据库版本 :
                                            </Text>
                                            <Text style={{ fontSize: '11px' }}>{dataSource.version}</Text>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Text strong style={{ fontSize: '12px' }}>
                                                连接URL :
                                            </Text>
                                            <Text
                                                ellipsis={{ tooltip: dataSource.url }}
                                                style={{ maxWidth: 200, textAlign: 'right', fontSize: '11px' }}
                                                type="secondary"
                                            >
                                                {dataSource.url}
                                            </Text>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* 分页区域 */}
                {filteredDataSources.length > pageSize && (
                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <Pagination
                            current={currentPage}
                            total={filteredDataSources.length}
                            pageSize={pageSize}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showQuickJumper
                            showTotal={(total, range) =>
                                `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据源`
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccessPage;
