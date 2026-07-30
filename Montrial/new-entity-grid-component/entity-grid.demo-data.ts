import { EntityNode } from './entity-grid.model';

/**
 * Matches RAW_DATA from the original entity-grid-demo.jsx exactly —
 * same 4 root entities, same ocifIds, same nesting depth.
 * Pass this directly as @Input() entityGridData.
 */

const ADDR = '33 Dundas St W, Toronto, ON M5G 2C3';

const leaf = (
  ocifId: string,
  profileName: string,
  legalHoldStatus: 'LEGAL HOLD' | 'N/A',
  holdName: string,
  role: string,
): EntityNode => ({
  ocifId,
  profileName,
  legalHoldStatus,
  holdName,
  lifecycle: 'Active Customer',
  role,
  address: ADDR,
  isParent: false,
  isExpanded: false,
  isSuspect: false,
  children: [],
});

export const ENTITY_GRID_DEMO_DATA: EntityNode[] = [
  {
    ocifId: 'C2-001',
    profileName: 'Corp 2',
    legalHoldStatus: 'N/A',
    holdName: '',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR,
    isParent: true,
    isExpanded: true,
    isSuspect: false,
    children: [
      leaf('C2-002', 'Role Player 01', 'N/A', '', 'Authorized Signatory'),
    ],
  },
  {
    ocifId: 'C3-001',
    profileName: 'Corp 3',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'legalhold_name_123',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR,
    isParent: true,
    isExpanded: true,
    isSuspect: true,
    children: [
      leaf('C3-002', 'Role Player Y1', 'N/A', '', 'Authorized Signatory'),
    ],
  },
  {
    ocifId: 'C4-001',
    profileName: 'Corp 4',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'legalhold_name_123',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR,
    isParent: true,
    isExpanded: true,
    isSuspect: false,
    children: [
      {
        ocifId: 'C5-001',
        profileName: 'Corp 5',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Owner',
        address: ADDR,
        isParent: true,
        isExpanded: true,
        isSuspect: false,
        children: [
          {
            ocifId: 'C6-001',
            profileName: 'Corp 6',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123',
            lifecycle: 'Active Customer',
            role: 'Owner',
            address: ADDR,
            isParent: true,
            isExpanded: true,
            isSuspect: false,
            children: [
              leaf('C6-002', 'Role Player H', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
              leaf('C6-003', 'Role Player I', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
            ],
          },
          leaf('C5-002', 'Role Player F', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
          leaf('C5-003', 'Role Player G', 'N/A', '', 'Authorized Signatory of ABC Ltd.'),
        ],
      },
    ],
  },
  {
    ocifId: 'ABC-001',
    profileName: 'ABC Ltd.',
    legalHoldStatus: 'N/A',
    holdName: '',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR,
    isParent: true,
    isExpanded: true,
    isSuspect: true,
    children: [
      {
        ocifId: 'ABC-002',
        profileName: 'ABC Sub Ltd.',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'legalhold_name_123',
        lifecycle: 'Active Customer',
        role: 'Authorized Signatory',
        address: ADDR,
        isParent: true,
        isExpanded: true,
        isSuspect: false,
        children: [
          leaf('ABC-003', 'ABC Sub-Sub 1', 'N/A', '', 'Authorized Signatory'),
          {
            ocifId: 'ABC-004',
            profileName: 'ABC Sub-Sub 2',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123',
            lifecycle: 'Active Customer',
            role: 'Owner',
            address: ADDR,
            isParent: true,
            isExpanded: true,
            isSuspect: false,
            children: [
              {
                ocifId: 'ABC-005',
                profileName: 'Deep Entity L3',
                legalHoldStatus: 'N/A',
                holdName: '',
                lifecycle: 'Active Customer',
                role: 'Authorized Signatory',
                address: ADDR,
                isParent: true,
                isExpanded: true,
                isSuspect: false,
                children: [
                  leaf('ABC-006', 'Deepest Entity L4', 'N/A', '', 'Authorized Signatory'),
                ],
              },
            ],
          },
        ],
      },
      leaf('ABC-007', 'ABC Partner Ltd.', 'N/A', '', 'Owner'),
    ],
  },
];
