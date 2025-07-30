import { AlertVariant } from "./alert.interface";

export interface Toast {
  id: number;
  type: AlertVariant;
  message: string;
  duration?: number | null;
}
