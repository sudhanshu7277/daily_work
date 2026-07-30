import { EntityNode } from './entity-grid.model';

const ADDR_TORONTO   = '570 Chantenay Dr, Mississauga, ON, L5A 1G2, CA';
const ADDR_MONTREAL  = '1000 De La Gauchetière St W, Montreal, QC, H3B 4W5, CA';
const ADDR_VANCOUVER = '200 Granville St, Vancouver, BC, V6C 1S4, CA';
const ADDR_CALGARY   = '707 8 Ave SW, Calgary, AB, T2P 1H5, CA';
const ADDR_OTTAWA    = '150 Elgin St, Ottawa, ON, K2P 1L4, CA';

// ── Leaf helper — no children, isParent: false
const leaf = (
  ocifId: string,
  profileName: string,
  legalHoldStatus: 'LEGAL HOLD' | 'N/A',
  holdName: string,
  lifecycle: string,
  role: string,
  address: string,
  isSuspect = false,
): EntityNode => ({
  ocifId,
  profileName,
  legalHoldStatus,
  holdName,
  lifecycle,
  role,
  address,
  isParent: false,
  isExpanded: false,
  isSuspect,
  children: [],
});

export const ENTITY_GRID_DUMMY_DATA: EntityNode[] = [

  // ── Root 1: Corp 2 — N/A, 1 child
  {
    ocifId: 'C2-001',
    profileName: 'Corp 2',
    legalHoldStatus: 'N/A',
    holdName: '',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR_TORONTO,
    isParent: true,
    isExpanded: true,
    isSuspect: false,
    children: [
      leaf('C2-002', 'Role Player 01', 'N/A', '', 'Active Customer', 'Authorized Signatory', ADDR_TORONTO),
    ],
  },

  // ── Root 2: Corp 3 — LEGAL HOLD, isSuspect, 1 child
  {
    ocifId: 'C3-001',
    profileName: 'Corp 3',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'legalhold_name_123',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR_MONTREAL,
    isParent: true,
    isExpanded: true,
    isSuspect: true,
    children: [
      leaf('C3-002', 'Role Player Y1', 'N/A', '', 'Active Customer', 'Authorized Signatory', ADDR_MONTREAL),
    ],
  },

  // ── Root 3: Corp 4 — LEGAL HOLD, 3-level deep
  {
    ocifId: 'C4-001',
    profileName: 'Corp 4',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'legalhold_name_123',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR_CALGARY,
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
        address: ADDR_CALGARY,
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
            address: ADDR_CALGARY,
            isParent: true,
            isExpanded: true,
            isSuspect: false,
            children: [
              leaf('C6-002', 'Role Player H', 'N/A', '', 'Active Customer', 'Authorized Signatory of ABC Ltd.', ADDR_TORONTO),
              leaf('C6-003', 'Role Player I', 'N/A', '', 'Active Customer', 'Authorized Signatory of ABC Ltd.', ADDR_TORONTO),
            ],
          },
          leaf('C5-002', 'Role Player F', 'N/A', '', 'Active Customer', 'Authorized Signatory of ABC Ltd.', ADDR_VANCOUVER),
          leaf('C5-003', 'Role Player G', 'N/A', '', 'Active Customer', 'Authorized Signatory of ABC Ltd.', ADDR_VANCOUVER),
        ],
      },
    ],
  },

  // ── Root 4: ABC Ltd. — N/A, isSuspect, 4-level deep
  {
    ocifId: 'ABC-001',
    profileName: 'ABC Ltd.',
    legalHoldStatus: 'N/A',
    holdName: '',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR_VANCOUVER,
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
        address: ADDR_TORONTO,
        isParent: true,
        isExpanded: true,
        isSuspect: false,
        children: [
          leaf('ABC-003', 'ABC Sub-Sub 1', 'N/A', '', 'Active Customer', 'Authorized Signatory', ADDR_OTTAWA),
          {
            ocifId: 'ABC-004',
            profileName: 'ABC Sub-Sub 2',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'legalhold_name_123',
            lifecycle: 'Active Customer',
            role: 'Owner',
            address: ADDR_MONTREAL,
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
                address: ADDR_OTTAWA,
                isParent: true,
                isExpanded: true,
                isSuspect: false,
                children: [
                  leaf('ABC-006', 'Deepest Entity L4', 'N/A', '', 'Active Customer', 'Authorized Signatory', ADDR_OTTAWA),
                ],
              },
            ],
          },
        ],
      },
      leaf('ABC-007', 'ABC Partner Ltd.', 'N/A', '', 'Active Customer', 'Owner', ADDR_CALGARY),
    ],
  },

  // ── Root 5: KIPTON DURAN — LEGAL HOLD, 2-level (real-name style)
  {
    ocifId: '5483785156524285112026072708484844421',
    profileName: 'KIPTON DURAN',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'LHTEST888',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR_TORONTO,
    isParent: true,
    isExpanded: true,
    isSuspect: false,
    children: [
      {
        ocifId: '4126785162254026112026072710241464',
        profileName: 'AKIRA GALVAN',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'LHTESTAPPLY178',
        lifecycle: 'Active Customer',
        role: 'Joint Owner',
        address: ADDR_TORONTO,
        isParent: true,
        isExpanded: true,
        isSuspect: false,
        children: [
          leaf('2748785156565780122026072708492589', 'VINAY MEHTA',   'N/A', '', 'Active Customer', 'Has Trusted Contact Person', ADDR_MONTREAL),
          leaf('4718785156568575112026072708492866', 'RITESTH SINGH', 'N/A', '', 'Active Customer', 'Has Trusted Contact Person', ADDR_TORONTO),
        ],
      },
      leaf('5761785156534523122026072708485460', 'VINAY MEHTA',   'LEGAL HOLD', 'LHTEST888', 'Active Customer', 'Has Trusted Contact Person', ADDR_VANCOUVER),
      leaf('4641785156537313112026072708485742', 'RITESTH SINGH', 'LEGAL HOLD', 'LHTest168', 'Active Customer', 'Has Trusted Contact Person', ADDR_TORONTO),
    ],
  },

  // ── Root 6: MARGARET CHEN — LEGAL HOLD, 1-level, isSuspect
  {
    ocifId: '6123456789012345678901234567890123456',
    profileName: 'MARGARET CHEN',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'LHTEST_CHEN_001',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR_VANCOUVER,
    isParent: true,
    isExpanded: true,
    isSuspect: true,
    children: [
      leaf('7234567890123456789012345678901234567', 'JAMES WONG',    'N/A',          '',                 'Active Customer', 'Authorized Signatory',     ADDR_VANCOUVER),
      leaf('8345678901234567890123456789012345678', 'LINDA PARK',    'LEGAL HOLD',   'LHTEST_CHEN_001',  'Active Customer', 'Authorized Signatory of ABC Ltd.', ADDR_MONTREAL, true),
      leaf('9456789012345678901234567890123456789', 'MICHAEL KUMAR', 'N/A',          '',                 'Active Customer', 'Has Trusted Contact Person', ADDR_CALGARY),
    ],
  },

  // ── Root 7: DAVID OKONKWO — N/A, no children (standalone leaf root)
  {
    ocifId: '1029384756102938475610293847561029384',
    profileName: 'DAVID OKONKWO',
    legalHoldStatus: 'N/A',
    holdName: '',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR_MONTREAL,
    isParent: false,
    isExpanded: false,
    isSuspect: false,
    children: [],
  },

  // ── Root 8: PATRICIA NGUYEN — LEGAL HOLD, 3-level deep, corporate chain
  {
    ocifId: '4056697831405669783140566978314056697',
    profileName: 'PATRICIA NGUYEN',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'LHTEST_NGUYEN_2026',
    lifecycle: 'Active Customer',
    role: 'Joint Owner',
    address: ADDR_CALGARY,
    isParent: true,
    isExpanded: true,
    isSuspect: false,
    children: [
      {
        ocifId: '5067708942516780894251678089425167808',
        profileName: 'NGUYEN HOLDINGS INC.',
        legalHoldStatus: 'LEGAL HOLD',
        holdName: 'LHTEST_NGUYEN_2026',
        lifecycle: 'Active Customer',
        role: 'Authorized Signatory',
        address: ADDR_CALGARY,
        isParent: true,
        isExpanded: true,
        isSuspect: false,
        children: [
          {
            ocifId: '6078819053627891905362789190536278919',
            profileName: 'NGUYEN REALTY TRUST',
            legalHoldStatus: 'LEGAL HOLD',
            holdName: 'LHTEST_NGUYEN_2026',
            lifecycle: 'Active Customer',
            role: 'Authorized Signatory of ABC Ltd.',
            address: ADDR_OTTAWA,
            isParent: true,
            isExpanded: true,
            isSuspect: false,
            children: [
              leaf('7089920164738902016473890201647389020', 'ANNA TRAN',    'N/A',          '',                     'Active Customer', 'Has Trusted Contact Person', ADDR_OTTAWA),
              leaf('8090031275849013127584901312758490131', 'FELIX DUMONT', 'LEGAL HOLD',   'LHTEST_NGUYEN_2026',   'Active Customer', 'Beneficiary',                ADDR_MONTREAL),
            ],
          },
        ],
      },
      leaf('9101142386950124238695012423869501242', 'HENRY PHAM', 'N/A', '', 'Active Customer', 'Has Trusted Contact Person', ADDR_VANCOUVER),
    ],
  },

  // ── Root 9: CHEN ENTERPRISES LTD. — LEGAL HOLD, corporate, 2-level
  {
    ocifId: '5667808942516790942516790942516790942',
    profileName: 'CHEN ENTERPRISES LTD.',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'LHTEST_CHEN_CORP_2026',
    lifecycle: 'Active Customer',
    role: 'Owner',
    address: ADDR_VANCOUVER,
    isParent: true,
    isExpanded: true,
    isSuspect: false,
    children: [
      leaf('6778919053627801053362780105336278010', 'WILLIAM CHEN',  'LEGAL HOLD', 'LHTEST_CHEN_CORP_2026', 'Active Customer', 'Director',   ADDR_VANCOUVER),
      leaf('7889020164738912164473891216447389121', 'GRACE LI',      'N/A',        '',                      'Active Customer', 'Director',   ADDR_TORONTO),
      leaf('8990131275849023275584902327558490232', 'OLIVER ZHANG',  'N/A',        '',                      'Active Customer', 'Secretary',  ADDR_MONTREAL),
      leaf('9001242386950134386695013438669501343', 'HELEN CHEN',    'N/A',        '',                      'Active Customer', 'Beneficiary',ADDR_CALGARY),
    ],
  },

  // ── Root 10: AISHA OKAFOR — LEGAL HOLD, isSuspect, 1-level
  {
    ocifId: '1223364508172346508172346508172346508',
    profileName: 'AISHA OKAFOR',
    legalHoldStatus: 'LEGAL HOLD',
    holdName: 'LHTEST_OKAFOR_007',
    lifecycle: 'Active Customer',
    role: 'Joint Owner',
    address: ADDR_MONTREAL,
    isParent: true,
    isExpanded: true,
    isSuspect: true,
    children: [
      leaf('2334475619283457619283457619283457619', 'CHIDI OKAFOR',  'LEGAL HOLD', 'LHTEST_OKAFOR_007', 'Active Customer', 'Authorized Signatory',     ADDR_TORONTO, true),
      leaf('3445586720394568720394568720394568720', 'FATIMA DIALLO', 'N/A',        '',                  'Active Customer', 'Has Trusted Contact Person', ADDR_MONTREAL),
      leaf('4556697831405679831405679831405679831', 'IBRAHIM SALL',  'N/A',        '',                  'Active Customer', 'Has Trusted Contact Person', ADDR_OTTAWA),
    ],
  },

];