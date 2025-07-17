import { format } from "date-fns";
import { useMemo } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { usePagination } from "@/context/pagination/usePagination";

import { type QueryResponse } from "@/types/query";

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

export default function DataGrid(props: QueryResponse) {
    const { limit, offset } = usePagination();
    
    const { schema, rows } = useMemo(() => {
        if (!props.table || props.table.numRows === 0)
            return { schema: [], rows: [] };
        const rows = props.table
            .slice(offset, offset + limit)
            .toArray()
            .map((row, index) => ({
                ...row.toJSON(),
                key: `row-${offset + index}`, // 添加唯一的 key
            }));
        const schema = getArrowTableSchema(props.table);
        return { schema, rows };
    }, [props, limit, offset]);

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

    return (
        <Table
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
            scroll={{ x: true }}
        />
    );
}
