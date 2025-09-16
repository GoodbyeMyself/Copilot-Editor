interface EmptyResultsProps {
    text?: string;
}

export default function EmptyResults({ text = "暂无查询结果" }: EmptyResultsProps) {
    return (
        <div className="flex size-full items-center justify-center">
            <p className="text-gray-400">{text}</p>
        </div>
    );
}
