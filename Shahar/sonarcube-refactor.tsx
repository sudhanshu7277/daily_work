//1. Define the Helper Function (outside or inside the component)

const getStageLabelColor = (
  idx: number,
  currentIdx: number,
  flags: { isDuplicate?: boolean; isDeleted?: boolean; isReviewRequired?: boolean }
): string => {
  const { isDuplicate, isDeleted, isReviewRequired } = flags;

  if (idx === currentIdx) {
    if (isDuplicate || isDeleted || isReviewRequired) {
      return '#D32F2F';
    }
    return '#F57C00';
  }

  if (idx < currentIdx) {
    return 'var(--lmn-color-primary, #002D72)';
  }

  return 'var(--lmn-text-weak, #888)';
};

// 2. Update the JSX Style Object in WorkflowCircles.tsx
//Replace lines 329–333 with the helper call:

style={{
  fontSize: 13,
  fontWeight: idx === currentIdx ? 700 : 400,
  color: getStageLabelColor(idx, currentIdx, { isDuplicate, isDeleted, isReviewRequired }),
  backgroundColor: '#F9F9FB',
  textAlign: 'center',
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
}}