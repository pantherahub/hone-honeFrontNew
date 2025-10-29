import { Observable } from "rxjs";

export interface ModalRef {
  onClose: Observable<any>;
  close: (returnData?: any) => void;
}
