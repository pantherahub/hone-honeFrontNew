export interface UserInterface {
   id?: number;
   email?: string;
   name?: string;
   idTypeDocument?: number;
   identificacion?: string;
   dv?: string | number;
   repsEnableCode?: string;
   withData?: boolean;
   rejected?: boolean;
   doesNeedSurvey?: boolean;
   roles?: RoleInterface;
}

export interface RoleInterface {
   idRoles?: number;
   nameRol?: string;
   slug?: string;
   description?: string;
   fullaccess?: string;
   createdAt?: Date;
   updatedAt?: Date;
   idClientHoneSolutions?: number;
}
