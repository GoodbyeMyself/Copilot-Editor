import { GetProp } from 'antd';
import { type AttachmentsProps } from '@ant-design/x';

import { BaseSenderHeader } from '../../../components/shared/chat';

interface SendHeaderProps {
    attachmentsOpen: boolean;
    onAttachmentsOpenChange: (open: boolean) => void;
    files: GetProp<AttachmentsProps, 'items'>;
    onFilesChange: (files: GetProp<AttachmentsProps, 'items'>) => void;
}

const SendHeader: React.FC<SendHeaderProps> = ({
    attachmentsOpen,
    onAttachmentsOpenChange,
    files,
    onFilesChange,
}) => {
    return (
        <BaseSenderHeader
            attachmentsOpen={attachmentsOpen}
            attachedFiles={files}
            onAttachmentsOpenChange={onAttachmentsOpenChange}
            onAttachedFilesChange={onFilesChange}
            title="Upload File"
            styles={{ content: { padding: 0 } }}
        />
    );
};

export default SendHeader; 