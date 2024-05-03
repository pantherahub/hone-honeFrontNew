export interface createContactProvider {
    idProvider:   number;
    idOccupation: number;
    name:         string;
    SurName:      string;
    phone:        string;
    email:        string;
}
// export interface GetContacProvider {
//     msg:      string;
//     contacts: Contact[];
// }

export interface GetContacProvider {
    idContactsProvider: number;
    idProvider:         number;
    idOccupation:       number;
    name:               string;
    SurName:            string;
    phone:              string;
    email:              string;
    occupation:         Occupation;
}

export interface Occupation {
    idOccupation: number;
    Occupation:   string;
}
