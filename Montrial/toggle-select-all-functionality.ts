// Solution
//Extract the modal title logic into a helper function or useMemo variable above the return statement, then pass that variable to title.

// 1. Define modalTitle before your JSX return:
//Add this snippet right above return ( (around line 562):

const modalTitle = useMemo(() => {
  if (mode === 'add') return 'Add Payment';
  if (mode === 'edit') return 'Edit Payment';
  if (readOnly) return 'View Payment Detail';
  return 'Verify Payment Detail';
}, [mode, readOnly]);


//2. Update the <Modal> props (lines 567–575):
//Change the inline JSX from:

title={
  mode === 'add'
    ? 'Add Payment'
    : mode === 'edit'
    ? 'Edit Payment'
    : readOnly
    ? 'View Payment Detail'
    : 'Verify Payment Detail'
}

//To simply:

title={modalTitle}