// Update line 5957 in InstructionDetailPage.tsx (shown in image_24.png) so the OK button closes the modal and executes fetchDetailsForAction():   

<Button
  color="primary"
  onClick={async () => {
    setPaymentSuccessInfo(null);
    try {
      await fetchDetailsForAction();
    } catch (err) {
      console.error('Failed to refresh details after payment success:', err);
    }
  }}
>
  OK
</Button>


//Also update onClose and onCancel (Lines 5952–5953)If the user dismisses the modal using the top-right X or pressing Escape, route through a single helper so the grid refreshes consistently:   

const handleCloseSuccessModal = async () => {
    setPaymentSuccessInfo(null);
    try {
      await fetchDetailsForAction();
    } catch (err) {
      console.error('Failed to refresh details after payment success:', err);
    }
  };


  //Then update the <Modal> props (lines 5952–5958):   

  onClose={handleCloseSuccessModal}
  onCancel={handleCloseSuccessModal}
  footer={
    <El className="lmn-d-flex lmn-justify-content-end">
      <Button color="primary" onClick={handleCloseSuccessModal}>
        OK
      </Button>
    </El>
  }