export interface UserInterface {
   id?: number;
   email?: string;
   name?: string;
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
