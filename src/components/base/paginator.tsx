import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

import { Button, Select } from "antd";

import { usePagination } from "@/context/pagination/usePagination";

function PageSize() {
    const { limit, onLimitChange, count } = usePagination();

    const onValueChange = (value: string) => {
        const size = Number(value);
        if (isNaN(size) || size < 0) return;
        onLimitChange(size);
    };

    const options = [
        { value: "10", label: "10" },
        { value: "15", label: "15" },
        { value: "25", label: "25" },
        { value: "50", label: "50" },
        { value: "100", label: "100" },
        { value: `${count ?? 100}`, label: "All" },
    ];

    // 过滤掉重复的选项
    const uniqueOptions = options.filter((option, index, self) => 
        index === self.findIndex(o => o.value === option.value)
    );

    return (
        <Select
            value={`${limit}`}
            onChange={onValueChange}
            options={uniqueOptions}
            style={{ width: 80 }}
            size="small"
        />
    );
}

/**
 * Pagination toolbar.
 *
 * To be used with the `PaginationProvider`.
 */
export default function PaginationToolbar() {
    const {
        canGoNext,
        canGoPrev,
        count,
        goToFirstPage,
        goToLastPage,
        limit,
        offset,
        onNextPage,
        onPrevPage,
    } = usePagination();
    const totalPages = limit > 0 ? Math.ceil(count / limit) : 0;
    const currentPage = limit > 0 ? Math.ceil(offset / limit) : 0;
    const pageNumber = totalPages > 0 ? currentPage + 1 : 0;

    return (
        <div className="flex flex-row flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-foreground">
                    {`页码 ${pageNumber} - ${totalPages}`}
                </span>
            </div>
            <PageSize />
            <div className="inline-flex items-center gap-1">
                <Button
                    size="small"
                    type="default"
                    onClick={goToFirstPage}
                    disabled={!canGoPrev}
                    icon={<ChevronsLeft className="size-4" />}
                />
                <Button
                    size="small"
                    type="default"
                    onClick={onPrevPage}
                    disabled={!canGoPrev}
                    icon={<ChevronLeft className="size-4" />}
                />

                <Button
                    size="small"
                    type="default"
                    onClick={onNextPage}
                    disabled={!canGoNext}
                    icon={<ChevronRight className="size-4" />}
                />

                <Button
                    size="small"
                    type="default"
                    onClick={goToLastPage}
                    disabled={!canGoNext}
                    icon={<ChevronsRight className="size-4" />}
                />
            </div>
        </div>
    );
}
