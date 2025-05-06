export interface UserInterface {
   id?: number;
   email?: string;
   name?: string;
   idTypeDocument?: number;
   identificacion?: string;
   dv?: string | number;
   withData?: boolean;
   rejected?: boolean;
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
