/// 1. Update PaymentParent.tsx
//In PaymentParent.tsx, update PaymentParentProps and its component
//  signature to accept and invoke these callback props:

export interface PaymentParentProps {
    mode?: 'maker' | 'checker' | 'repair';
    initialData?: Partial<Pain001Model> | null;
    customFieldConfig?: FormFieldConfig[];
    hideTabs?: boolean;
    onPaymentChange?: (output: PaymentComponentOutput) => void;
    onValidityChange?: (isValid: boolean) => void;
    onPaymentSuccess?: (referenceId: string, payload: Pain001Model) => void;
  }
  
  export const PaymentParent: FC<PaymentParentProps> = ({
    mode: initialMode = 'maker',
    initialData,
    customFieldConfig,
    hideTabs = false,
    onPaymentChange,
    onValidityChange,
    onPaymentSuccess
  }) => {
    // ... rest of your existing states (soeId, activeTab, etc.) ...
  
    // Use customFieldConfig if provided, otherwise fallback to PARENT_FIELD_CONFIG
    const activeFieldConfig = customFieldConfig || PARENT_FIELD_CONFIG;
  
    // Update handleMakerOutput to notify parent modal
    const handleMakerOutput = useCallback((output: PaymentComponentOutput) => {
      setMakerFormValid(output.isValid);
      setMakerPayload(output.paymentData);
      if (onValidityChange) {
        onValidityChange(output.isValid);
      }
      if (onPaymentChange) {
        onPaymentChange(output);
      }
    }, [onValidityChange, onPaymentChange]);
  
    // Inside your Maker Mode JSX:
    // Pass activeFieldConfig to PaymentChild:
    // <PaymentChild
    //   paymentInput={makerPaymentInput}
    //   fieldConfig={activeFieldConfig}
    //   isMakerMode={true}
    //   hardcapResultReceived={makerHardcapResult}
    //   onAmountChange={handleMakerAmountChange}
    //   onPaymentOutput={handleMakerOutput}
    // />


    // 2. Update SplitPaymentMakerModal.tsx
//Update the right panel in SplitPaymentMakerModal.tsx (around lines 196–206):

{/* Right Panel: 50% PaymentParent */}
<div className="split-maker-panel right-panel">
  <div className="split-form-scroll-pane">
    <PaymentParent
      mode="maker"
      initialData={initialData}
      customFieldConfig={fieldConfig}
      hideTabs={true}
      onPaymentChange={(output: any) => setOutputPayload(output)}
      onValidityChange={(isValid: boolean) => setIsFormValid(isValid)}
      onPaymentSuccess={(refId, payload) => {
        if (onPaymentSuccess) {
          onPaymentSuccess(refId, payload);
        }
        onClose();
      }}
    />
  </div>
</div>


// 3. Clear the Excel Cell Key Warnings (Yellow Squigglies)
//To eliminate the SonarQube/linter warnings in lines 183–184 of SplitPaymentMakerModal.tsx

{excelSheets[activeSheetIdx]?.data.map((row, rIdx) => (
    <tr key={`row-${rIdx}`}>
      <td className="split-excel-row-num">{rIdx + 1}</td>
      {row.map((cell, cIdx) => (
        <td key={`cell-${rIdx}-${cIdx}`}>
          {cell !== '' ? String(cell) : '\u00A0'}
        </td>
      ))}
    </tr>
  ))}








  // Step 1: Update the Component Destructuring in SplitPaymentMakerModal.tsx
//At the top of your SplitPaymentMakerModal component definition (around lines 25–40), 
// ensure onPaymentSuccess is added to the interface and destructured:

export interface SplitPaymentMakerModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: GabInstructionDocument | null;
    documents?: GabInstructionDocument[];
    onSelectDocument?: (doc: GabInstructionDocument) => Promise<void> | void;
    previewUrl: string | null;
    previewLoading?: boolean;
    fieldConfig?: FormFieldConfig[];
    initialData?: Partial<Pain001Model> | null;
    /** Add onPaymentSuccess here if not already present */
    onPaymentSuccess?: (referenceId: string, payload: Pain001Model) => void;
  }
  
  export const SplitPaymentMakerModal: React.FC<SplitPaymentMakerModalProps> = ({
    isOpen,
    onClose,
    document: doc,
    documents = [],
    onSelectDocument,
    previewUrl,
    previewLoading = false,
    fieldConfig,
    initialData,
    onPaymentSuccess // <-- ADD THIS DESTRUCTURED PROP HERE
  }) => {


    // Step 2: Clean up the <PaymentParent/> JSX Block (Lines 209–225)
//With onPaymentSuccess destructured, update the JSX block on the right panel:

{/* Right Panel: 50% PaymentParent */}
<div className="split-maker-panel right-panel">
  <div className="split-form-scroll-pane">
    <PaymentParent
      mode="maker"
      initialData={initialData}
      customFieldConfig={fieldConfig}
      hideTabs={true}
      onPaymentChange={(output: any) => setOutputPayload(output)}
      onValidityChange={(isValid: boolean) => setIsFormValid(isValid)}
      onPaymentSuccess={(refId: string, payload: any) => {
        if (onPaymentSuccess) {
          onPaymentSuccess(refId, payload);
        }
        onClose();
      }}
    />
  </div>
</div>



