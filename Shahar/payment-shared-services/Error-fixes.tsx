// Step 1: Update the Status Column in InstructionDetailPage.tsx
// In InstructionDetailPage.tsx, update lines 385–391 (shown in image 47):

{
  headerName: 'Status',
  colId: 'status',
  minWidth: 130,
  sortable: true,
  filter: true,
  cellRenderer: () => {
    return (
      <StatusTag
        status={(instruction?.status) as InstructionStatus}
        region={instruction?.region ?? null}
      />
    );
  },
},


//Step 2: Configure the Yellow Tag Styling for PAYMENT_MAKER
// In StatusTag.tsx:

// Update in StatusTag.tsx (lines 19–29):


// 1. Remove PAYMENT_MAKER from grey statuses so it gets custom color
const LATAM_GREY_STATUSES: ReadonlySet<InstructionStatus> = new Set<InstructionStatus>([
  'PAYMENT_CHECKER',
  'PAYMENT_REWORK',
  // 'CALLBACK_VALIDATION',
]);

// 2. Define the yellow border & background colors in CUSTOM_STATUS_HEX
const CUSTOM_STATUS_HEX: Partial<Record<InstructionStatus, string>> = {
  PAYMENT_MAKER: '#D97706',       // Yellow-amber text & border
  PAYMENT_CHECKER: '#1abc9c',
  XCEPTOR_RETRY_REQUIRED: '#e84393',
};

// Update the <Tag> styles in StatusTag.tsx (around lines 54–58):
// Match the light yellow pill styling from your reference screenshot:

const isPaymentMaker = status === 'PAYMENT_MAKER';

return (
  <Tag
    {...(usePresetTagColor ? { color: statusColor(status) } : {})}
    className={grey ? 'lmn-mx-4px lmn-tag-default' : 'lmn-mx-4px'}
    style={{
      display: 'inline-flex',
      width: 'max-content',
      padding: '2px 8px',
      margin: '0 auto',
      justifyContent: 'center',
      alignItems: 'center',
      height: 'auto',
      fontSize: '11px',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      textAlign: 'center',
      borderRadius: '4px',
      ...(isPaymentMaker
        ? {
            backgroundColor: '#FFFBEB',
            borderColor: '#F59E0B',
            color: '#B45309',
          }
        : customHex
        ? {
            backgroundColor: customHex,
            borderColor: customHex,
            color: '#ffffff',
          }
        : {}),
      ...(isAdminRework
        ? {
            backgroundColor: '#F19188',
            borderColor: '#F19188',
            color: '#1F1F1F',
          }
        : {}),
    }}
  >
    {statusLabel(status)}
  </Tag>
);