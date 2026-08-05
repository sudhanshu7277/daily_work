// 1. Define the handler function inside InstructionDetailPage:

const handleOriginalInstructionClick = useCallback((e: React.MouseEvent, ref: string) => {
  e.preventDefault();
  getInstructionByRef(ref)
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

// 2. Simplify the JSX table cell (lines 1484–1509):

<td style={{ fontSize: 11 }}>
  {instruction.originalInstruction ? (
    <a
      href="#"
      onClick={(e) => handleOriginalInstructionClick(e, instruction.originalInstruction!)}
      style={{ textDecoration: 'underline', cursor: 'pointer' }}
    >
      {instruction.originalInstruction}
    </a>
  ) : (
    instruction.relatedInstructions || '-'
  )}
</td>