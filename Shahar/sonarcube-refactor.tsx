//WorkflowCircles.tsx

// Define status mappings outside the component or hook
const ADMIN_CHECKER_STATUSES = new Set([
  'PENDING_DUPLICATE',
  'TO_BE_DELETED',
  'SENT_TO_XCEPTOR_FOR_PROCESSING',
  'XCEPTOR_PROCESSING_REQUEST_TIMEOUT',
]);

const findStageIndex = (stages: any[], targetKey: string): number => {
  const idx = stages.findIndex((s) => s.statusKey === targetKey);
  return idx >= 0 ? idx : -1;
};

// ... inside WorkflowCircles component:

const currentIdx = useMemo(() => {
  // 1. Direct match check
  const idx = stages.findIndex((s) => s.statusKey === status);
  if (idx >= 0) return idx;

  // 2. Terminal statuses
  if (TERMINAL_STATUSES.includes(status) || status === 'DUPLICATE') {
    return stages.length - 1;
  }

  // 3. Payment Maker mapped statuses
  if (
    status === 'PAYMENT_REWORK' ||
    status === 'ADMIN_PAYMENT_MAKER' ||
    NAM_PAYMENT_MAKER_STATUSES.includes(status)
  ) {
    const pmIdx = findStageIndex(stages, 'PAYMENT_MAKER');
    if (pmIdx >= 0) return pmIdx;
  }

  // 4. Admin Checker mapped statuses
  if (ADMIN_CHECKER_STATUSES.has(status)) {
    const acIdx = findStageIndex(stages, 'ADMIN_CHECKER');
    if (acIdx >= 0) return acIdx;
  }

  // 5. Admin Maker mapped status
  if (status === 'XCEPTOR_RETRY_REQUIRED') {
    const amIdx = findStageIndex(stages, 'ADMIN_MAKER');
    if (amIdx >= 0) return amIdx;
  }

  // 6. Payment Super Checker mapped status
  if (status === 'PAYMENT_SUPER_CHECKER') {
    const pcIdx = findStageIndex(stages, 'PAYMENT_CHECKER');
    if (pcIdx >= 0) return pcIdx;

    const completeIdx = findStageIndex(stages, 'COMPLETE');
    if (completeIdx > 0) return completeIdx - 1;

    return stages.length - 1;
  }

  return 0;
}, [stages, status]);