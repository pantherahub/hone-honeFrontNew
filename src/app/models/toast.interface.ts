import { AlertVariant } from "./alert.interface";

export interface Toast {
  id: number;
  type: AlertVariant;
  message: string;
  color?: AlertVariant;
  duration?: number | null;
}
