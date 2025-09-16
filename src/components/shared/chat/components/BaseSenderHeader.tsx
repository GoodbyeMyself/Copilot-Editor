import React from 'react';
import { Sender, Attachments } from '@ant-design/x';
import { CloudUploadOutlined } from '@ant-design/icons';

import { BaseSenderHeaderProps } from '../types';

interface BaseSenderHeaderComponentProps extends BaseSenderHeaderProps {
    title?: string;
    className?: string;
    styles?: any;
}

const BaseSenderHeader: React.FC<BaseSenderHeaderComponentProps> = ({
    attachmentsOpen,
    attachedFiles,
    onAttachmentsOpenChange,
    onAttachedFilesChange,
    title = "Upload File",
    className = '',
    styles = {},
}) => {
    return (
        <Sender.Header
            title={title}
            styles={{ content: { padding: 0 }, ...styles }}
            open={attachmentsOpen}
            onOpenChange={onAttachmentsOpenChange}
            forceRender
            className={className}
        >
            <Attachments
                beforeUpload={() => false}
                items={attachedFiles}
                onChange={({ fileList }) => onAttachedFilesChange(fileList)}
                placeholder={(type) =>
                    type === 'drop'
                        ? { title: 'Drop file here' }
                        : {
                            icon: <CloudUploadOutlined />,
                            title: 'Upload files',
                            description: 'Click or drag files to this area to upload',
                        }
                }
            />
        </Sender.Header>
    );
};

export default BaseSenderHeader;