// cmd to run tests locally

npx vitest run --coverage

// cmd to find build issues

npx tsc --noEmit

// Refactored Code for SetupInstructionModal.tsx


const [selectedClient, setSelectedClient] = useState<AwsClient | null>(null);



const [selectedDeal, setSelectedDeal] = useState<AwsDeal | null>(null);