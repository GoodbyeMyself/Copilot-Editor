import React from 'react';
import { type GetProp } from 'antd';
import { Attachments, Sender } from '@ant-design/x';
import { CloudUploadOutlined } from '@ant-design/icons';

interface SenderHeaderProps {
    attachmentsOpen: boolean;
    attachedFiles: GetProp<typeof Attachments, 'items'>;
    onAttachmentsOpenChange: (open: boolean) => void;
    onAttachedFilesChange: (files: GetProp<typeof Attachments, 'items'>) => void;
}

const SenderHeader: React.FC<SenderHeaderProps> = ({
    attachmentsOpen,
    attachedFiles,
    onAttachmentsOpenChange,
    onAttachedFilesChange,
}) => {
    return (
        <Sender.Header
            title="Upload File"
            open={attachmentsOpen}
            onOpenChange={onAttachmentsOpenChange}
            styles={{ content: { padding: 0 } }}
        >
            <Attachments
                beforeUpload={() => false}
                items={attachedFiles}
                onChange={(info) => onAttachedFilesChange(info.fileList)}
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

export default SenderHeader; 