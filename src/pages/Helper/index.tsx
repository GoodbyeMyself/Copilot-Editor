
import React, { useRef, useState } from 'react';

// 助手式 公共布局
import CopilotLayout from '@/layouts/Copilot/layout';

import './styles.less';


const HelperPage: React.FC = () => {

    // ==================== State =================
    const [copilotOpen, setCopilotOpen] = useState(false);
    const copilotRef = useRef<any>(null);

    return (
        <div
            className="helper-page"
        >
            <CopilotLayout
                onCopilotRefReady={(ref) => { copilotRef.current = ref.current; }}
                onClose={() => setCopilotOpen(false)}
            >
                {!copilotOpen && (
                    <div
                        onClick={() => {
                            copilotRef.current?.expand();
                            setCopilotOpen(true);
                        }}
                        className="helper-workarea-header-button"
                    >
                        ✨ AI Copilot
                    </div>
                )}
            </CopilotLayout>
        </div>
    );
};

export default HelperPage;
