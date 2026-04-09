export interface CustomerNode {
    legalName: string;
    ocifId: string;
    status: 'LEGAL HOLD' | 'N/A';
    holdName: string;
    lifecycle: string;
    role: string;
    address: string;
    customerStatus: string;
    roleType: string;
    isParent: boolean;
    isExpanded: boolean;
    children: CustomerNode[];
  }
  
  export interface CustomerSearchResponse {
    data: CustomerNode[];
    totalCount: number;
  }