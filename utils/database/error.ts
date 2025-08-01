export type ModelValidationError<DocType> = {
  [P in keyof DocType]?: {
    path: P;
    value: DocType[P] | undefined;
  }
};