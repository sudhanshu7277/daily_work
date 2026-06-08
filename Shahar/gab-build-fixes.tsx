// InstructionDetailPage.test.tsx

import { vi, beforeEach, describe, it, expect } from 'vitest';

// 🌟 Intercept the network request before it tries to hit port 3000
vi.mock('../../api/instructions', () => ({
  getInstructionDetail: vi.fn(() => Promise.resolve({ data: { instructionId: '123', status: 'DRAFT' } })),
  getDealParties: vi.fn(() => Promise.resolve({ data: [] })),
  getDocuments: vi.fn(() => Promise.resolve({ data: [] }))
}));


// Error 2: Ambiguous Testing Library Query (Found multiple elements with the text: DMC Document ID)

// InstructionDetailPage.test.tsx

// Old: const header = screen.getByText('DMC Document ID');

// New: Targets the exact table header cell specifically
const header = screen.getByRole('columnheader', { name: /DMC Document ID/i });

//React does not recognize the 'iconSuffix' prop on a DOM element.

//This is happening because an input wrapper component is passing iconSuffix all the way down into a native HTML <input> element. While it won't crash your build, you can clean your console logs by opening InstructionDetailPage.tsx around line 95 and making sure custom props are destructured away before spreading variables onto a raw DOM tag

// Instead of: const Input = ({ ...props }) => <input {...props} />;
// Clear the custom prop out of the spread assignment:
const { iconSuffix, ...htmlInputProps } = props;
return <input { ...htmlInputProps } />;