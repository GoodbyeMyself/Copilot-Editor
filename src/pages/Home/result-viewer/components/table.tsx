import { memo, useEffect, useMemo } from "react";

import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";

import { format } from "date-fns";

import PaginationToolbar from "@/components/base/paginator";

import { ScrollArea } from "@/components/base/ui/scroll-area";

import { usePagination } from "@/context/pagination/usePagination";

import { useQuery } from "@/context/query/useQuery";

import EmptyResults from "./slot/empty";

import { getArrowTableSchema } from "@/utils/arrow/helpers";

import { getColumnType } from "@/utils/duckdb/helpers/getColumnType";

type DynamicTypeViewerProps = {
    type:
    | "bigint"
    | "number"
    | "integer"
    | "boolean"
    | "date"
    | "string"
    | "other";
    value: unknown;
};

function dynamicTypeViewer(props: DynamicTypeViewerProps) {
    const { type, value } = props;

    switch (type) {
        case "date": {
            const date = format(new Date(value as string), "PPpp");
            return date;
        }
        case "string": {
            return value as string;
        }
        case "bigint": {
            return (value as bigint).toString();
        }
        case "boolean": {
            return `${value}` as string;
        }
        case "other": {
            return JSON.stringify(value);
        }
        case "integer":
        case "number": {
            if (isNaN(value as number)) return "";
            // round to 2 decimal places
            const formatter = new Intl.NumberFormat("en-UK", {
                maximumFractionDigits: 2,
            });
            return (
                <span className="text-right">{formatter.format(value as number)}</span>
            );
        }
        default:
            return "";
    }
}

export const TableViewer = memo(function TableViewer() {
    const { table, count } = useQuery();

    const { onSetCount, limit, offset } = usePagination();

    // Update the count when we receive data (don't like this pattern...)
    useEffect(() => {
        onSetCount(count);
    }, [onSetCount, count]);

    const noQuery = table.numRows === 0 && table.numCols === 0;

    const { schema, rows } = useMemo(() => {
        if (!table || table.numRows === 0)
            return { schema: [], rows: [] };
        const rows = table
            .slice(offset, offset + limit)
            .toArray()
            .map((row, index) => ({
                ...row.toJSON(),
                key: `row-${offset + index}`, // 添加唯一的 key
            }));
        const schema = getArrowTableSchema(table);
        return { schema, rows };
    }, [table, limit, offset]);

    const columns: ColumnsType<any> = useMemo(() => {
        return schema.map((column) => {
            const type = column.type ?? "other";
            const coercedType = getColumnType(type);
            
            return {
                title: column.name,
                dataIndex: column.name,
                key: column.name,
                render: (value: unknown) => {
                    return dynamicTypeViewer({
                        type: coercedType,
                        value,
                    });
                },
            };
        });
    }, [schema]);

    if (noQuery) {
        return (
            <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4">
                <EmptyResults />
            </div>
        );
    }

    return (
        <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4">
           <>
                <ScrollArea className="h-full border">
                    <Table
                        columns={columns}
                        dataSource={rows}
                        pagination={false}
                        size="small"
                        // scroll={{
                        //     x: true,
                        //     y: 'calc(100vh - 300px)'
                        // }}
                        sticky={{
                            offsetHeader: 0
                        }}
                    />
                </ScrollArea>
                <div className="flex w-full flex-wrap-reverse items-center justify-end sm:h-12">
                    <PaginationToolbar />
                </div>
            </>
        </div>
    );
});
