// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx


const [, setSelectedClient] = useState<AwsClient | null>(null);

const [, setSelectedDeal] = useState<AwsDeal | null>(null);