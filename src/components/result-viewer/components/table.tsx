import { memo, useEffect } from "react";

import DataGrid from "@/components/base/data-grid";

import PaginationToolbar from "@/components/base/paginator";

import { ScrollArea } from "@/components/base/ui/scroll-area";

import { usePagination } from "@/context/pagination/usePagination";

import { useQuery } from "@/context/query/useQuery";

import EmptyResults from "./slot/empty";

export const TableViewer = memo(function TableViewer() {
    const { table, meta, count } = useQuery();

    const { onSetCount } = usePagination();

    // Update the count when we receive data (don't like this pattern...)
    useEffect(() => {
        onSetCount(count);
    }, [onSetCount, count]);

    const noQuery = table.numRows === 0 && table.numCols === 0;

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
                    <DataGrid
                        count={count}
                        table={table}
                        meta={meta}
                    />
                </ScrollArea>
                <div className="flex w-full flex-wrap-reverse items-center justify-end sm:h-12">
                    <PaginationToolbar />
                </div>
            </>
        </div>
    );
});
