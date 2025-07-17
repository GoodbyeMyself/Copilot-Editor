"use client";

import type * as Plot from "@observablehq/plot";
import { Card, Select, Space, Typography } from "antd";

import { useChart } from "../context/useChart";

const { Title, Text } = Typography;

// Don't seem to have any effect on Plot.auto mark.
const schemaOptions: {
    value: NonNullable<Plot.ScaleOptions["scheme"]>;
    label: string;
}[] = [
        {
            label: "Category10",
            value: "category10",
        },
        {
            label: "Accent",
            value: "accent",
        },
        {
            label: "Dark2",
            value: "dark2",
        },
        {
            label: "Paired",
            value: "paired",
        },
        {
            label: "Pastel1",
            value: "pastel1",
        },
        {
            label: "Pastel2",
            value: "pastel2",
        },
        {
            label: "Set1",
            value: "set1",
        },
        {
            label: "Set2",
            value: "set2",
        },
        {
            label: "Set3",
            value: "set3",
        },
        {
            label: "Tableau10",
            value: "tableau10",
        },
    ];

export default function PlotSettings() {
    const { scheme, _dispatch } = useChart();

    return (
        <div className="pr-10">
            <Card
                title={
                    <Space direction="vertical" size={0}>
                        <Title level={4} style={{ margin: 0 }}>Chart Settings</Title>
                        <Text type="secondary">Adjust the settings for your chart.</Text>
                    </Space>
                }
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Text strong>Scheme</Text>
                        <Select
                            value={scheme}
                            onChange={(v) => {
                                if (!v) return;
                                _dispatch({
                                    type: "SET_SCHEME",
                                    payload: {
                                        scheme: v as Plot.ScaleOptions["scheme"],
                                    },
                                });
                            }}
                            placeholder="Select"
                            style={{ width: '100%', marginTop: 8 }}
                            options={schemaOptions}
                        />
                    </div>
                </Space>
            </Card>
        </div>
    );
}
