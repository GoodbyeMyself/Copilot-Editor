import type { AutoOptions } from "@observablehq/plot";

import { memo, useEffect } from "react";

import { Select } from "antd";

import Chart from "@/components/base/plot";

import { ChartProvider } from "@/components/base/plot/context/provider";

import { useChart } from "@/components/base/plot/context/useChart";

import { ScrollArea } from "@/components/base/ui/scroll-area";

import { useQuery } from "@/context/query/useQuery";

import { getArrowTableSchema } from "@/utils/arrow/helpers";

import EmptyResults from "./slot/empty";

type OptionPickerProps = {
    title: string;
    onValueChange: (value: string) => void;
    current: string;
    options: string[];
};

function OptionPicker(props: OptionPickerProps) {
    const { onValueChange, current, options, title } = props;

    const selectOptions = options.map(option => ({
        value: option,
        label: option
    }));

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">{title}</p>
            <Select
                value={current}
                onChange={onValueChange}
                options={selectOptions}
                placeholder={`Select ${title}`}
                style={{ width: 180 }}
                size="small"
            />
        </div>
    );
}

const markOptions: NonNullable<AutoOptions["mark"]>[] = [
    "line",
    "area",
    "bar",
    "dot",
    "rule",
];

function MarkPicker() {
    const { _dispatch, mark } = useChart();

    const onValueChange = (mark: AutoOptions["mark"]) => {
        _dispatch({
            type: "SET_MARK",
            payload: {
                mark,
            },
        });
    };

    return (
        <OptionPicker
            current={mark ?? "line"}
            onValueChange={(v) => onValueChange(v as AutoOptions["mark"])}
            options={markOptions}
            title="Mark"
        />
    );
}

type SelectAxisProps = {
    axis: "x" | "y";
};

function SelectAxis(props: SelectAxisProps) {
    const { axis } = props;

    const { x, y, _dispatch, columns } = useChart();

    const current = axis === "x" ? x : y;
    const options = columns.map((c) => c.name);

    const onValueChange = (value: string) => {
        _dispatch({
            type: axis === "x" ? "SET_X" : "SET_Y",
            payload: {
                ...(axis === "x" ? { x: value } : { y: value }),
            },
        });
    };

    const selectOptions = options.map(option => ({
        value: option,
        label: option
    }));

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-500">{`${axis.toUpperCase()} Axis`}</p>
            <Select
                value={current?.toString() || ""}
                onChange={onValueChange}
                options={selectOptions}
                placeholder={`Select ${axis}`}
                style={{ width: 180 }}
                size="small"
            />
        </div>
    );
}

function Settings() {
    return (
        <div className="inline-flex w-full items-center gap-2">
            <MarkPicker />
            <SelectAxis axis="x" />
            <SelectAxis axis="y" />
        </div>
    );
}

/**
 * WIP
 */
function ChartViewer() {
    const { table } = useQuery();

    const { _dispatch } = useChart();

    useEffect(() => {
        const schema = getArrowTableSchema(table);
        if (!schema.length) return;

        _dispatch({
            type: "INITIALIZE",
            payload: {
                data: {
                    rows: table.toArray(),
                    columns: schema,
                },

                options: {
                    x: schema.length > 0 && schema[0] ? schema[0].name : "",
                    y: schema.length > 1 && schema[1] ? schema[1].name : "",
                },
            },
        });
    }, [_dispatch, table]);

    if (table.numRows === 0) {
        return <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4">
            <EmptyResults />
        </div> ;
    }

    return (
        <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4">
            <Settings />
            <ScrollArea className="mb-4 h-full max-h-[550px] border p-4">
                <Chart />
            </ScrollArea>
        </div>
    );
}

export const ChartContainer = memo(function ChartContainer() {
    return (
        <ChartProvider>
            <ChartViewer />
        </ChartProvider>
    );
});
