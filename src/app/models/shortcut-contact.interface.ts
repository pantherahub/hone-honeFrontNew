export interface ShortcutContact {
  label: string;
  isContactRequired: boolean;
  shortcut: {
    idOccupationType: number;
    idOccupation: number;
    [key: string]: any;
  };
  // [key: string]: any;
}
