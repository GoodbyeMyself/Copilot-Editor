import React from 'react';
// umi
import { Outlet } from 'umi';

const LayoutComponent: React.FC = () => {

    return (
        <>
            <Outlet />
        </>
    );
};

export default LayoutComponent;
