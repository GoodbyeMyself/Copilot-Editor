import {
    CloudUploadOutlined,
} from '@ant-design/icons';

import {
    Attachments,
    type AttachmentsProps,
    Sender,
} from '@ant-design/x';

import { GetProp, GetRef } from 'antd';

import React from 'react';

interface SendHeaderProps {
    attachmentsOpen: boolean;
    onAttachmentsOpenChange: (open: boolean) => void;
    attachmentsRef: React.RefObject<GetRef<typeof Attachments>>;
    files: GetProp<AttachmentsProps, 'items'>;
    onFilesChange: (files: GetProp<AttachmentsProps, 'items'>) => void;
}

const SendHeader: React.FC<SendHeaderProps> = ({
    attachmentsOpen,
    onAttachmentsOpenChange,
    attachmentsRef,
    files,
    onFilesChange,
}) => {
    return (
        <Sender.Header
            title="Upload File"
            styles={{ content: { padding: 0 } }}
            open={attachmentsOpen}
            onOpenChange={onAttachmentsOpenChange}
            forceRender
        >
            <Attachments
                ref={attachmentsRef}
                beforeUpload={() => false}
                items={files}
                onChange={({ fileList }) => onFilesChange(fileList)}
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

export default SendHeader; 