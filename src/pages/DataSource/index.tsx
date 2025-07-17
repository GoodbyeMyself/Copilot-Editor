import React, { useState, useMemo } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Space,
    Input,
    Typography,
    Avatar,
    Badge,
    Divider,
    Pagination,
    Modal,
    Form,
    Select,
    App,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    LinkOutlined,
    DatabaseOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import SvgIcon from '@/components/common/SvgIcon';

import { useSession } from "@/context/session/useSession";
import { TreeDataSource } from "@/types/files/dataset";

const { Search } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

// 数据源管理页面使用的数据结构
interface DataSourceItem {
    id: string;
    name: string;
    type: string;
    icon: string;
    status: 'connected' | 'disconnected' | 'warning';
    url: string;
    version: string;
    description: string;
    key: string;
    dataSourceType: string;
    connectionString: string;
    tables: any[];
}

const AccessPage: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const { sources, onAddDataSource, onRemoveDataSource } = useSession();
    const { message } = App.useApp();

    // 根据数据库类型获取图标
    const getIconByType = (type: string): string => {
        const iconMap: Record<string, string> = {
            'MySQL': 'icon-mysql',
            'PostgreSQL': 'icon-pgsql',
            'Redis': 'icon-redis',
            'MongoDB': 'icon-MongoDB',
            'Oracle': 'icon-oracle',
            'Alipay': 'icon-zhifubao',
        };
        return iconMap[type] || 'icon-database';
    };

    // 获取随机状态（实际应用中应该从数据库连接状态获取）
    const getRandomStatus = (): 'connected' | 'disconnected' | 'warning' => {
        const statuses: ('connected' | 'disconnected' | 'warning')[] = ['connected', 'disconnected', 'warning'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    };

    // 将全局状态中的 TreeDataSource 转换为管理页面需要的 DataSourceItem 格式
    const dataSourceItems: DataSourceItem[] = useMemo(() => {
        return sources
            .filter(source => source.kind === "TREE_DATASET")
            .map((source: TreeDataSource) => {
                const database = source.database;
                return {
                    id: source.id,
                    name: database.title,
                    type: database.dataSourceType || 'Unknown',
                    icon: getIconByType(database.dataSourceType || 'Unknown'),
                    status: getRandomStatus(), // 这里可以根据实际情况设置状态
                    url: database.connectionString || '',
                    version: '1.0.0', // 可以从数据库获取或设置默认值
                    description: `${database.dataSourceType || 'Unknown'} 数据源`,
                    key: database.key,
                    dataSourceType: database.dataSourceType || 'Unknown',
                    connectionString: database.connectionString || '',
                    tables: database.tables || [],
                };
            });
    }, [sources]);

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
    const filteredDataSources = dataSourceItems.filter(item =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.type.toLowerCase().includes(searchValue.toLowerCase())
    );

    // 分页数据
    const paginatedData = filteredDataSources.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleAddDataSource = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            // 创建新的数据源
            const newDataSource: TreeDataSource = {
                kind: "TREE_DATASET",
                id: `new-${Date.now()}`,
                path: `new-${Date.now()}`,
                database: {
                    key: `new-${Date.now()}`,
                    title: values.name,
                    type: 'database',
                    dataSourceType: values.type,
                    connectionString: values.url,
                    tables: [], // 新数据源暂时没有表
                },
            };

            // 添加到全局状态
            await onAddDataSource(newDataSource);
            
            setIsModalVisible(false);
            form.resetFields();
            message.success('数据源添加成功');
        } catch (error) {
            console.error('添加数据源失败:', error);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setCurrentPage(1);
    };

    const handleDeleteDataSource = async (dataSourceId: string) => {
        try {
            await onRemoveDataSource(dataSourceId);
            message.success('数据源删除成功');
        } catch (error) {
            console.error('删除数据源失败:', error);
            message.error('删除数据源失败');
        }
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
                                        <DeleteOutlined 
                                            key="delete" 
                                            onClick={() => handleDeleteDataSource(dataSource.id)}
                                        />
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
                                                数据库类型 :
                                            </Text>
                                            <Text style={{ fontSize: '11px' }}>
                                                {dataSource.type}
                                            </Text>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: '12px' }}>
                                                版本 :
                                            </Text>
                                            <Text style={{ fontSize: '11px' }}>
                                                {dataSource.version}
                                            </Text>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: '12px' }}>
                                                连接地址 :
                                            </Text>
                                            <Text style={{ fontSize: '11px' }} ellipsis={{ tooltip: dataSource.url }}>
                                                {dataSource.url}
                                            </Text>
                                        </div>
                                    </Space>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>

                {/* 分页 */}
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Pagination
                        current={currentPage}
                        total={filteredDataSources.length}
                        pageSize={pageSize}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                    />
                </div>

                {/* 添加数据源模态框 */}
                <Modal
                    title="添加数据源"
                    open={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    okText="添加"
                    cancelText="取消"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            status: 'connected',
                            version: '1.0.0',
                        }}
                    >
                        <Form.Item
                            name="name"
                            label="数据源名称"
                            rules={[{ required: true, message: '请输入数据源名称' }]}
                        >
                            <Input placeholder="请输入数据源名称" />
                        </Form.Item>

                        <Form.Item
                            name="type"
                            label="数据库类型"
                            rules={[{ required: true, message: '请选择数据库类型' }]}
                        >
                            <Select placeholder="请选择数据库类型">
                                <Option value="MySQL">MySQL</Option>
                                <Option value="PostgreSQL">PostgreSQL</Option>
                                <Option value="Redis">Redis</Option>
                                <Option value="MongoDB">MongoDB</Option>
                                <Option value="Oracle">Oracle</Option>
                                <Option value="Alipay">Alipay</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="url"
                            label="连接地址"
                            rules={[{ required: true, message: '请输入连接地址' }]}
                        >
                            <Input placeholder="请输入连接地址" />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="描述"
                        >
                            <Input.TextArea placeholder="请输入数据源描述" rows={3} />
                        </Form.Item>

                        <Form.Item
                            name="version"
                            label="版本"
                        >
                            <Input placeholder="请输入版本号" />
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label="连接状态"
                        >
                            <Select>
                                <Option value="connected">已连接</Option>
                                <Option value="disconnected">连接失败</Option>
                                <Option value="warning">连接异常</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default AccessPage;
