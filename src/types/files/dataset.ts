export const datasetFileExts = [
  "csv",
  "json",
  "txt",
  "duckdb",
  "sqlite",
  "postgresql",
  "parquet",
  "arrow",
  "excel",
  "url",
] as const;

export type DatasetFileExt = (typeof datasetFileExts)[number];

export function isDatasetFileExt(x: unknown): x is DatasetFileExt {
  return datasetFileExts.includes(x as DatasetFileExt);
}

export const datasetMimeTypes = [
  "text/csv",
  "application/json",
  "text/plain",
  "application/duckdb",
  "application/sqlite",
  "application/postgresql",
  "application/parquet",
  "application/arrow",
  "application/excel",
  "text/x-uri",
];

// ------ Dataset Mime Types ------ //

export type DatasetMimeType = (typeof datasetMimeTypes)[number];

export function isDatasetMimeType(x: unknown): x is DatasetMimeType {
  return datasetMimeTypes.includes(x as DatasetMimeType);
}

export const datasetExtMap: Record<DatasetFileExt, DatasetMimeType> = {
  csv: "text/csv",
  json: "application/json",
  txt: "text/plain",
  duckdb: "application/duckdb",
  sqlite: "application/sqlite",
  postgresql: "application/postgresql",
  parquet: "application/parquet",
  arrow: "application/arrow",
  excel: "application/excel",
  url: "text/x-uri", // remote sources
};

// 树形数据源节点类型
export type DataSourceNodeType = "database" | "table" | "field";

// 树形数据源字段定义
export interface DataSourceField {
  key: string;
  title: string;
  type: DataSourceNodeType;
  dataType?: string; // 字段数据类型，如 VARCHAR, INT 等
}

// 树形数据源表定义
export interface DataSourceTable {
  key: string;
  title: string;
  type: DataSourceNodeType;
  fields: DataSourceField[];
}

// 树形数据源数据库定义
export interface DataSourceDatabase {
  key: string;
  title: string;
  type: DataSourceNodeType;
  dataSourceType?: string; // 数据源类型，如 'MySQL', 'PostgreSQL' 等
  connectionString?: string; // 数据库连接字符串
  tables: DataSourceTable[];
}

// 扩展的数据源类型，支持树形结构
export type TreeDataSource = {
  kind: "TREE_DATASET";
  id: string;
  path: string;
  database: DataSourceDatabase;
};

export type Dataset = {
  kind: "DATASET";
  mimeType: DatasetMimeType;
  ext: DatasetFileExt;
  handle: FileSystemFileHandle;
  path: string;
} | TreeDataSource;
