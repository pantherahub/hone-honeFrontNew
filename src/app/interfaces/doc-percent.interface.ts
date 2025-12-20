export interface CompliancePercentInterface {
   uploaded: number;
   expired: number;
   remaining: number;
   total: number;
}

export interface LoadedPercentInterface {
   upToDate: number;
   expired: number;
   pendingApproval: number;
   notUploaded: number;
   total: number;
}

export interface PercentInterface {
   compliance?: CompliancePercentInterface;
   loaded?: LoadedPercentInterface;
}
