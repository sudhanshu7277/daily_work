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
