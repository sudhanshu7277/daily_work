interface GridRow {
    legalName: string;
    ocifId: string;
    status: string;
    holdName?: string;
    lifecycle: string;
    role: string;
    address: string;
    isParent?: boolean;
    isExpanded?: boolean;
    children?: GridRow[];
  }