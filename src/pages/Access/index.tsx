import { Access, useAccess } from '@umijs/max';

import { Button } from 'antd';

const AccessPage: React.FC = () => {
    const access = useAccess();
    return (
        <div style={{ padding: 24 }}>
            <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 8, height: 'calc(100vh - 104px)' }}>
                <Access accessible={access.canSeeAdmin}>
                    <Button>只有 Admin 可以看到这个按钮</Button>
                </Access>
            </div>
        </div>
    );
};

export default AccessPage;
