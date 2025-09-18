export const PYTHON_EXCEL_SAMPLE = `# -*- coding: utf-8 -*-
"""
示例：使用 pandas 读取 Excel，并进行简单的数据预览与导出。
运行此脚本前，请确保已安装 pandas 与 openpyxl：

    pip install pandas openpyxl
"""

import pandas as pd


def load_excel(filepath: str, sheet_name: int | str = 0) -> pd.DataFrame:
    """
    读取 Excel 文件并返回 DataFrame

    :param filepath: Excel 文件路径，例如 'data.xlsx'
    :param sheet_name: 工作表名称或索引，默认第一个工作表
    :return: pandas.DataFrame
    """
    df = pd.read_excel(filepath, sheet_name=sheet_name)
    print("=== 基本信息 ===")
    print(df.info())
    print("\n=== 前几行预览 ===")
    print(df.head(10))
    return df


def simple_transform(df: pd.DataFrame) -> pd.DataFrame:
    """对数据做一个非常简单的处理示例。"""
    # 选择前 10 行；若实际需要可替换为筛选条件，如 df[df['col'] > 0]
    top10 = df.head(10).copy()
    # 演示新增一列（行号）
    top10["row_no"] = range(1, len(top10) + 1)
    return top10


def main():
    # 请将 data.xlsx 替换为你的 Excel 路径
    input_path = "data.xlsx"
    output_path = "output.csv"

    df = load_excel(input_path)
    result = simple_transform(df)
    result.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"已将处理结果保存到: {output_path}")


if __name__ == "__main__":
    main()
`;

export default PYTHON_EXCEL_SAMPLE;

