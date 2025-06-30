import { memo, useEffect, useState } from "react";

import DataGrid from "@/components/base/data-grid";

import PaginationToolbar from "@/components/base/paginator";

import { Label } from "@/components/base/ui/label";

import { ScrollArea } from "@/components/base/ui/scroll-area";

import { Switch } from "@/components/base/ui/switch";

import VirtualizedGrid from "@/components/base/virtualized-grid";

import { usePagination } from "@/context/pagination/usePagination";

import { useQuery } from "@/context/query/useQuery";

import EmptyResults from "./empty";

export const TableViewer = memo(function TableViewer() {
    const [view, setView] = useState<"table" | "list">("table");
    const { table, meta, count } = useQuery();

    const { onSetCount } = usePagination();

    // Update the count when we receive data (don't like this pattern...)
    useEffect(() => {
        onSetCount(count);
    }, [onSetCount, count]);

    const noQuery = table.numRows === 0 && table.numCols === 0;

    return (
        <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4 pb-20">
            {noQuery && <EmptyResults />}
            <ScrollArea className="h-full border">
                {view === "table" && (
                    <DataGrid
                        count={count}
                        table={table}
                        meta={meta}
                    />
                )}
                {view === "list" && <VirtualizedGrid />}
            </ScrollArea>
            <div className="flex w-full flex-wrap-reverse items-center justify-between sm:h-12">
                <div className="flex items-center space-x-2">
                    <Switch
                        onCheckedChange={(checked) => {
                            setView(checked ? "list" : "table");
                        }}
                        id="beta-list"
                    />
                    <Label htmlFor="beta-list">列表展示</Label>
                </div>

                {view === "table" && <PaginationToolbar />}
            </div>
        </div>
    );
});
