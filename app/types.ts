// main
export interface FilterType {
  [key: string]: unknown;
}
export interface OptionsType {
  [key: string]: unknown;
}
export interface SchemaDefinitionTypeType {
  type: string;
}
export interface SchemaDefinitionType {
  [key: string]: SchemaDefinitionTypeType;
}
export interface DataRowType {
  [key: string]: string;
}
export interface SchemaEtcType {
  [key: string]: string;
}
export interface QueryDataType {
  [key: string]: DataRowType[];
}

// render

export interface MaterialTableColumnType {
  field: string;
  hidden?: boolean;
  title?: string;
  type?: string;
  headerStyle?: unknown;
  lookup?: string[];
}
