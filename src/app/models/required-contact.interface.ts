export interface RequiredContact {
  label: string;
  shortcut: {
    idOccupationType: number;
    idOccupation: number;
    [key: string]: any;
  };
  // [key: string]: any;
}
