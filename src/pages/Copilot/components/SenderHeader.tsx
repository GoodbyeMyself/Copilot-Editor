import React from 'react';
import { type GetProp } from 'antd';
import { Attachments } from '@ant-design/x';

import { BaseSenderHeader } from '../../../components/shared/chat';

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
        <BaseSenderHeader
            attachmentsOpen={attachmentsOpen}
            attachedFiles={attachedFiles}
            onAttachmentsOpenChange={onAttachmentsOpenChange}
            onAttachedFilesChange={onAttachedFilesChange}
            title="Upload File"
            styles={{ content: { padding: 0 } }}
        />
    );
};

export default SenderHeader; 