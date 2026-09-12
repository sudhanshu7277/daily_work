// 1. Guard handlePaymentOutput (Bottom-up)
// Update lines 260–267 in PaymentParent.tsx:

const handlePaymentOutput = useCallback((output: PaymentComponentOutput) => {
  const newValid = Boolean(output?.isValid);
  const newDualBlind = Boolean(output?.isDualBlindKeyPassed);

  setIsCurrentFormValid((prev) => (prev !== newValid ? newValid : prev));
  setCheckerDualBlindPassed((prev) => (prev !== newDualBlind ? newDualBlind : prev));

  if (output?.paymentData) {
    setCurrentFormPayload((prev) => {
      if (prev && JSON.stringify(prev) === JSON.stringify(output.paymentData)) {
        return prev;
      }
      return output.paymentData;
    });
  }
}, []);


// 2. Stabilize paymentModel / initialData (Top-down)
// In lines 250–258 (from your image_28.png):


paymentModel: initialData ? { ...createEmptyPain001(), ...initialData } : null


// If initialData is passed as an inline object from 
// InstructionDetailPage.tsx, { ...createEmptyPain001(), ...initialData } 
// produces a new object reference every time PaymentParent renders.

//To ensure this model only generates once when the modal opens:


// Above the switch/useMemo block in PaymentParent.tsx
const stableInitialPaymentModel = useMemo(() => {
  return initialData ? { ...createEmptyPain001(), ...initialData } : null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [initialData?.debtorAccountNumber, initialData?.instructedAmount]);

// Then reference stableInitialPaymentModel on line 256:

paymentModel: stableInitialPaymentModel,




/// pagination fixes


private buildPageNumbers(): (number | '…')[] {
  const t = this.totalPages;
  const c = this.currentPage;
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);

  const pages: (number | '…')[] = [];
  const ellipsis: '…' = '…';

  if (c <= 4) {
    // Near start: 1, 2, 3, 4, 5, …, lastPage
    for (let i = 1; i <= 5; i++) {
      pages.push(i);
    }
    pages.push(ellipsis);
    pages.push(t);
  } else if (c >= t - 3) {
    // Near end: 1, …, lastPage-4, lastPage-3, lastPage-2, lastPage-1, lastPage
    pages.push(1);
    pages.push(ellipsis);
    for (let i = t - 4; i <= t; i++) {
      pages.push(i);
    }
  } else {
    // Middle sliding window: 1, …, c-1, c, c+1, …, lastPage
    pages.push(1);
    pages.push(ellipsis);
    for (let i = c - 1; i <= c + 1; i++) {
      pages.push(i);
    }
    pages.push(ellipsis);
    pages.push(t);
  }

  return pages;
}





// File 1: multi-level-grid.config.ts
// Lines 70–92 in image_31.png show the conflicting settings: 
// flex: 2 forces the column to stretch dynamically across r
// emaining container space, while overflow: 'hidden' and whiteSpace:
//  'nowrap' clip the content when nested indents push the text out.

// Update the definition to maintain minWidth: 170 and width: 
// 170 while using a dynamic cellStyle callback:


{
  field: 'profileName',
  headerName: 'Profile Name',
  sortable: true,
  minWidth: 170,
  width: 170,
  flex: 1,
  headerComponent: NameHeaderComponent,
  headerComponentParams: {
    onSelectAll: onHeaderCheckClick,
    state: 'none'
  },
  cellRenderer: NameCellComponent,
  cellRendererParams: {
    onCheck: onCheckboxClick,
    onToggle: toggleExpand
  },
  cellStyle: (params) => {
    const level = (params.data as any)?._level ?? 0;
    return {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '4px',
      paddingRight: '8px',
      overflow: 'hidden',
      minWidth: `${170 + level * 20}px`
    };
  }
},

    // File 2: name-renderers.component.ts
// In NameCellComponent styles (around lines 48–74), 
// ensure the inner container adapts to the dynamic cell 
// width and allows long names to fit properly:


:host {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.name-text {
  color: #0079c1;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 auto;
  min-width: 0;
}


// File 3: multi-level-customer-grid.component.scss
// Add this rule to prevent the selection highlight 
// layer in AG Grid from altering cell bounding boxes:


.ag-cell[col-id="profileName"] {
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
}

.ag-row.ag-row-selected .ag-cell[col-id="profileName"] {
  width: auto;
}
