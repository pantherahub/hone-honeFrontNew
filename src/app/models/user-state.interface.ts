export interface RoleState {
  idRoles?: number;
  nameRol?: string;
  slug?: string;
  description?: string;
  fullaccess?: string;
  createdAt?: Date;
  updatedAt?: Date;
  idClientHoneSolutions?: number;
}

export interface ProviderState {
  idProvider: number;
  razonSocial: string;
  email: string;
}

export interface ClientState {
  idClientHoneSolutions: number;
  clientHoneSolutions: string;
}

export interface UserState {
  idUser: number;
  names: string;
  lastNames: string;
  fullName: string;
  idTypeDocument: number;
  identification: string;
  dv?: string | number;
  repsEnableCode?: string;
  email: string;
  avatar: string;
  Roles?: any[];
  Permissions?: any[];
  provider?: ProviderState | null;
  client?: ClientState | null;

  birthDate?: Date;
  phone1?: string;
  phone2?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthUserState {
  id?: number;
  email?: string;
  name?: string;
  withData?: boolean;
  rejected?: boolean;
  doesNeedSurvey?: boolean;
  roles?: RoleState;
  user?: UserState;
}
