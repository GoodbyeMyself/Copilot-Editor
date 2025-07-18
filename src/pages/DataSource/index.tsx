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
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    LinkOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    EditOutlined,
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
    type: string; // 当前层级节点类型，如 'database'
    status: 'connected' | 'disconnected' | 'warning';
    url: string;
    version: string;
    description: string;
    key: string;
    dataSourceType: string; // 数据源类型，如 'MySQL', 'PostgreSQL' 等
    connectionString: string;
    tables: any[];
}

const AccessPage: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingDataSource, setEditingDataSource] = useState<DataSourceItem | null>(null);
    const [deletingDataSourceId, setDeletingDataSourceId] = useState<string | null>(null);
    const [testingDataSourceId, setTestingDataSourceId] = useState<string | null>(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const { sources, onAddDataSource, onRemoveDataSource, onUpdateDataSource } = useSession();
    const { message, modal } = App.useApp();

    // 根据数据源类型获取图标
    const getIconByDataSourceType = (dataSourceType: string): string => {
        const iconMap: Record<string, string> = {
            'MySQL': 'icon-mysql',
            'PostgreSQL': 'icon-pgsql',
            'Redis': 'icon-redis',
            'MongoDB': 'icon-MongoDB',
            'Oracle': 'icon-oracle',
            'Alipay': 'icon-zhifubao',
        };
        return iconMap[dataSourceType] || 'icon-database';
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
                    type: 'database', // 当前层级节点类型
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

    // 处理编辑数据源
    const handleEditDataSource = (dataSource: DataSourceItem) => {
        setEditingDataSource(dataSource);
        editForm.setFieldsValue({
            name: dataSource.name,
            type: dataSource.dataSourceType,
            url: dataSource.connectionString,
            description: dataSource.description,
            version: dataSource.version,
            status: dataSource.status,
        });
        setIsEditModalVisible(true);
    };

    // 处理编辑模态框确认
    const handleEditModalOk = async () => {
        try {
            const values = await editForm.validateFields();
            
            if (!editingDataSource) return;

            // 找到对应的TreeDataSource并更新
            const sourceToUpdate = sources.find(source => 
                source.kind === "TREE_DATASET" && source.id === editingDataSource.id
            ) as TreeDataSource | undefined;

            if (!sourceToUpdate) {
                message.error('未找到要更新的数据源');
                return;
            }

            // 创建更新后的数据源
            const updatedTreeDataSource: TreeDataSource = {
                ...sourceToUpdate,
                database: {
                    ...sourceToUpdate.database,
                    title: values.name,
                    dataSourceType: values.type,
                    connectionString: values.url,
                },
            };

            // 更新本地缓存
            await onUpdateDataSource(editingDataSource.id, updatedTreeDataSource);
            
            setIsEditModalVisible(false);
            editForm.resetFields();
            setEditingDataSource(null);
            message.success(`数据源 "${values.name}" 更新成功`);
        } catch (error) {
            console.error('更新数据源失败:', error);
            message.error('更新数据源失败');
        }
    };

    // 处理编辑模态框取消
    const handleEditModalCancel = () => {
        setIsEditModalVisible(false);
        editForm.resetFields();
        setEditingDataSource(null);
    };

    // 测试连接功能
    const handleTestConnection = async (dataSource: DataSourceItem) => {
        setTestingDataSourceId(dataSource.id);
        
        try {
            // 模拟测试连接过程
            await new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    // 模拟连接测试结果 - 这里可以根据实际情况调用真实的连接测试API
                    const isSuccess = Math.random() > 0.3; // 70% 成功率
                    if (isSuccess) {
                        resolve();
                    } else {
                        reject(new Error('连接失败'));
                    }
                }, 2000);
            });
            
            message.success(`数据源 "${dataSource.name}" 连接测试成功！`);
        } catch (error) {
            console.error('连接测试失败:', error);
            message.error(`数据源 "${dataSource.name}" 连接测试失败，请检查连接配置！`);
        } finally {
            setTestingDataSourceId(null);
        }
    };

    // 生成随机字段
    const generateRandomFields = (dataSourceKey: string, tableKey: string): any[] => {
        const fieldTypes = ['INTEGER', 'VARCHAR(255)', 'TEXT', 'DECIMAL(10,2)', 'TIMESTAMP', 'BOOLEAN', 'JSON', 'BLOB', 'DATE', 'DATETIME'];
        const fieldNames = ['id', 'name', 'title', 'description', 'status', 'created_at', 'updated_at', 'user_id', 'category_id', 'price', 'quantity', 'type', 'content', 'url', 'email', 'phone', 'address', 'code', 'version', 'remark', 'amount', 'count', 'total', 'value', 'key', 'data', 'info', 'note', 'tag', 'label', 'group', 'level', 'score', 'rate', 'percent', 'ratio', 'size', 'length', 'width', 'height', 'weight', 'color', 'style', 'format', 'pattern', 'rule', 'config', 'setting', 'option', 'choice', 'select', 'input', 'output', 'result', 'response', 'request', 'query', 'search', 'filter', 'sort', 'order', 'rank', 'index', 'position', 'location', 'place', 'area', 'region', 'zone', 'district', 'city', 'state', 'country', 'continent', 'world', 'universe', 'space', 'time', 'date', 'year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond', 'microsecond', 'nanosecond'];
        
        const fields = [];
        const usedFieldNames = new Set(); // 用于跟踪已使用的字段名
        
        for (let i = 0; i < 10; i++) {
            let fieldName;
            let attempts = 0;
            
            // 确保字段名唯一
            do {
                fieldName = fieldNames[Math.floor(Math.random() * fieldNames.length)];
                attempts++;
                // 如果尝试次数过多，添加数字后缀确保唯一性
                if (attempts > 10) {
                    fieldName = `${fieldName}_${i}`;
                    break;
                }
            } while (usedFieldNames.has(fieldName));
            
            usedFieldNames.add(fieldName);
            const fieldType = fieldTypes[Math.floor(Math.random() * fieldTypes.length)];
            
            fields.push({
                key: `${dataSourceKey}-${tableKey}-${fieldName}`,
                title: fieldName,
                type: 'field',
                dataType: fieldType,
            });
        }
        return fields;
    };

    // 生成随机表
    const generateRandomTables = (dataSourceKey: string): any[] => {
        const tables = [];
        const usedTableNames = new Set(); // 用于跟踪已使用的表名
        
        for (let i = 0; i < 5; i++) {
            let tableName;
            let attempts = 0;
            
            // 确保表名唯一
            do {
                const tablePrefixes = ['user', 'order', 'product', 'category', 'payment', 'log', 'config', 'file', 'message', 'notification'];
                const tableSuffixes = ['info', 'data', 'record', 'list', 'detail', 'summary', 'stats', 'history', 'backup', 'temp'];
                const prefix = tablePrefixes[Math.floor(Math.random() * tablePrefixes.length)];
                const suffix = tableSuffixes[Math.floor(Math.random() * tableSuffixes.length)];
                tableName = `${prefix}_${suffix}`;
                attempts++;
                // 如果尝试次数过多，添加数字后缀确保唯一性
                if (attempts > 10) {
                    tableName = `${tableName}_${i}`;
                    break;
                }
            } while (usedTableNames.has(tableName));
            
            usedTableNames.add(tableName);
            const tableKey = `${dataSourceKey}-${tableName}`;
            
            tables.push({
                key: tableKey,
                title: `${tableName}表`,
                type: 'table',
                fields: generateRandomFields(dataSourceKey, tableName)
            });
        }
        return tables;
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            
            const dataSourceKey = `new-${Date.now()}`;
            
            // 创建新的数据源
            const newDataSource: TreeDataSource = {
                kind: "TREE_DATASET",
                id: dataSourceKey,
                path: dataSourceKey,
                database: {
                    key: dataSourceKey,
                    title: values.name,
                    type: 'database',
                    dataSourceType: values.type,
                    connectionString: values.url,
                    tables: generateRandomTables(dataSourceKey), // 生成随机表
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

    // 改进的删除数据源功能
    const handleDeleteDataSource = async (dataSourceId: string, dataSourceName: string) => {
        // 显示确认对话框
        modal.confirm({
            title: '确认删除数据源',
            content: (
                <div>
                    <p>您确定要删除数据源 <strong>&quot;{dataSourceName}&quot;</strong> 吗 ？</p>
                    <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
                        此操作不可撤销，删除后将无法恢复 !
                    </p>
                </div>
            ),
            okText: '确认删除',
            cancelText: '取消',
            okType: 'danger',
            onOk: async () => {
                try {
                    setDeletingDataSourceId(dataSourceId);
                    
                    // 模拟删除延迟
                    await new Promise<void>(resolve => {
                        setTimeout(() => resolve(), 1000);
                    });
                    
                    await onRemoveDataSource(dataSourceId);
                    message.success(`数据源 " ${dataSourceName} " 删除成功`);
                    
                    // 如果当前页没有数据了，跳转到上一页
                    if (paginatedData.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    }
                } catch (error) {
                    console.error('删除数据源失败:', error);
                    message.error(`删除数据源 &quot;${dataSourceName}&quot; 失败`);
                } finally {
                    setDeletingDataSourceId(null);
                }
            },
        });
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
                        const isDeleting = deletingDataSourceId === dataSource.id;
                        const isTesting = testingDataSourceId === dataSource.id;
                        
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} key={dataSource.id}>
                                <Card
                                    hoverable
                                    style={{ 
                                        height: '100%',
                                        opacity: (isDeleting || isTesting) ? 0.6 : 1,
                                        transition: 'opacity 0.3s ease'
                                    }}
                                    actions={[
                                        <Tooltip title="测试连接" key="test">
                                            <LinkOutlined 
                                                style={{ 
                                                    color: isTesting ? '#d9d9d9' : '#1890ff',
                                                    cursor: isTesting ? 'not-allowed' : 'pointer'
                                                }}
                                                spin={isTesting}
                                                onClick={() => handleTestConnection(dataSource)}
                                            />
                                        </Tooltip>,
                                        <Tooltip title="编辑数据源" key="edit">
                                            <EditOutlined 
                                                style={{ color: '#52c41a' }}
                                                onClick={() => handleEditDataSource(dataSource)}
                                            />
                                        </Tooltip>,
                                        <Tooltip title="删除数据源" key="delete">
                                            <DeleteOutlined 
                                                style={{ 
                                                    color: isDeleting ? '#d9d9d9' : '#ff4d4f',
                                                    cursor: isDeleting ? 'not-allowed' : 'pointer'
                                                }}
                                                spin={isDeleting}
                                                onClick={() => handleDeleteDataSource(dataSource.id, dataSource.name)}
                                            />
                                        </Tooltip>
                                    ]}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                        <Avatar
                                            size={48}
                                            style={{ marginRight: 12, border: '1px solid #f0f0f0', backgroundColor: '#f8f8f8' }}
                                            icon={<SvgIcon type={getIconByDataSourceType(dataSource.dataSourceType)} style={{ fontSize: '24px' }}/>}
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
                <div style={{ marginTop: 24}}>
                    <Pagination
                        current={currentPage}
                        total={filteredDataSources.length}
                        pageSize={pageSize}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                        style={{ float: 'right' }}
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

                {/* 编辑数据源模态框 */}
                <Modal
                    title="编辑数据源"
                    open={isEditModalVisible}
                    onOk={handleEditModalOk}
                    onCancel={handleEditModalCancel}
                    okText="保存"
                    cancelText="取消"
                >
                    <Form
                        form={editForm}
                        layout="vertical"
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
