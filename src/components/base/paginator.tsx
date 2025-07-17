import { Pagination } from "antd";

import { usePagination } from "@/context/pagination/usePagination";

/**
 * Pagination toolbar using Antd Pagination component.
 *
 * To be used with the `PaginationProvider`.
 */
export default function PaginationToolbar() {
    const {
        count,
        limit,
        offset,
        goToPage,
        onLimitChange,
    } = usePagination();

    const currentPage = limit > 0 ? Math.floor(offset / limit) + 1 : 1;

    const handlePageChange = (page: number, pageSize: number) => {
        // 如果页面大小改变，更新 limit
        if (pageSize !== limit) {
            onLimitChange(pageSize);
        }
        // 跳转到指定页面
        goToPage(page - 1); // 转换为从0开始的索引
    };

    return (
        <div className="flex flex-row flex-wrap items-center gap-4">
            <Pagination
                current={currentPage}
                total={count}
                pageSize={limit}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => 
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }
                pageSizeOptions={['10', '15', '25', '50', '100']}
                onChange={handlePageChange}
                size="small"
            />
        </div>
    );
}
