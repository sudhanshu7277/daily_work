// Step 1: Add the click handler helper
//Add this function inside InstructionDetailPage (outside of renderInstructionDetails):

const handleOriginalInstructionClick = useCallback((e: React.MouseEvent, refString: string) => {
  e.preventDefault();
  
  getInstructionByRef(refString)
    .then((res) => {
      window.open(buildInstructionPath(res.data.instructionId), '_blank', 'noopener,noreferrer');
    })
    .catch(() => {
      notification.danger({
        title: 'Error',
        content: 'Original instruction not found',
      });
    });
}, []);



// Step 2: Update the if block (Lines 1486–1503)
//Replace lines 1486–1503 with this clean return statement:

if (instruction.originalInstruction) {
  return (
    <a
      href="#"
      onClick={(e) => handleOriginalInstructionClick(e, instruction.originalInstruction!)}
      style={{ textDecoration: 'underline', cursor: 'pointer' }}
    >
      {instruction.originalInstruction}
    </a>
  );
}