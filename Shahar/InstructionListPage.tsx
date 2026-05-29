// 1. State Tracking and Action Handlers
// Add these configurations right at the top of your InstructionListPage 
//functional component to track which row IDs are active and to handle your button trigger states cleanly:


// Selection tracking and UI modal controls
const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
const [isCommentModalOpen, setIsCommentModalOpen] = useState<boolean>(false);
const [bulkCommentText, setBulkCommentText] = useState<string>('');
const [submittingComment, setSubmittingComment] = useState<boolean>(false);

// Toggles selection state for an individual item row
const handleRowSelectToggle = (instructionId: number) => {
  setSelectedRowIds(prev => 
    prev.includes(instructionId)
      ? prev.filter(id => id !== instructionId)
      : [...prev, instructionId]
  );
};

// Toggles the check status for all rows in the dataset at once
const handleSelectAllToggle = (isChecked: boolean) => {
  if (isChecked) {
    // Collects IDs from the current active data window
    const allIds = filteredData.map((item: any) => item.instructionId);
    setSelectedRowIds(allIds);
  } else {
    setSelectedRowIds([]);
  }
};

// Bulk action submission execution loop
const handleBulkCommentSubmit = async () => {
  if (!bulkCommentText.trim()) return;
  setSubmittingComment(true);
  try {
    // API orchestration payload loop mapping against target selected row items
    // e.g., await Promise.all(selectedRowIds.map(id => addComment(id, { text: bulkCommentText })));
    
    notification.success({
      title: 'Action Completed',
      content: `Successfully applied comment to ${selectedRowIds.length} instruction items.`
    });
    
    // Clear state inputs on success framework clearance
    setBulkCommentText('');
    setSelectedRowIds([]);
    setIsCommentModalOpen(false);
    
    // Trigger your loadData() reload hook here if available
  } catch (error: any) {
    notification.danger({
      title: 'Submission Failed',
      content: error?.message || 'An error occurred while appending bulk actions.'
    });
  } finally {
    setSubmittingComment(false);
  }
};


// 2. Update Column Configurations (columns)
// Modify the first object element block inside your const columns: any = [ setup 
    //(visible on Image 275) to swap the raw component attributes with interactive checked/unchecked lifecycle handlers:

    const columns: any = [
        {
          title: (
            <El className="lmn-d-flex lmn-align-items-center">
              <input 
                type="checkbox"
                style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                onChange={(e) => handleSelectAllToggle(e.target.checked)}
                checked={filteredData.length > 0 && selectedRowIds.length === filteredData.length}
              />
            </El>
          ),
          dataIndex: 'instructionId',
          key: 'selection',
          width: 60,
          onHeaderCell: () => ({ className: 'table-header' }),
          render: (instructionId: number) => (
            <input 
              type="checkbox"
              style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
              checked={selectedRowIds.includes(instructionId)}
              onChange={() => handleRowSelectToggle(instructionId)}
            />
          ),
        },
        // Keep your other 9 column items ('Sequence No.', 'Source & Category', etc.) unchanged
      ];


// 3. Add Comments Trigger Button
//Place the operational "Add Comments" 
//controller button bar layout directly inside your header or metrics dashboard deck area configuration panel:

<El className="lmn-d-flex lmn-align-items-center" style={{ gap: '12px' }}>
  <Button 
    color="outline" 
    size="sm"
    disabled={selectedRowIds.length === 0}
    onClick={() => setIsCommentModalOpen(true)}
  >
    <Icon type="message-circle" style={{ marginRight: '6px' }} />
    Add Comments ({selectedRowIds.length})
  </Button>
</El>



// 4. Background Overlay & Modal Layout Shell
// Append this clean processing layout wrapper at the 
//very bottom of your return JSX payload (right next to your existing SetupInstructionModal or ApprovalModal blocks):


{/* Action Modal with Grayish Transparent Backdrop Overlay */}
<Modal
  visible={isCommentModalOpen}
  onCancel={() => {
    setIsCommentModalOpen(false);
    setBulkCommentText('');
  }}
  title={`Add Bulk Comment — (${selectedRowIds.length}) Items Selected`}
  onApply={handleBulkCommentSubmit}
  applyText={submittingComment ? 'Submitting...' : 'Submit'}
  disabled={!bulkCommentText.trim() || submittingComment}
  style={{ maxWidth: '600px' }}
>
  <El style={{ padding: '8px' }}>
    <El className="lmn-form-group" style={{ marginBottom: '16px' }}>
      <label 
        className="lmn-form-label" 
        style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px', color: '#333' }}
      >
        Enter Comment Details (Applies to all checked files)
      </label>
      <TextArea 
        placeholder="Type structural processing parameters or comment feedback logs here..."
        value={bulkCommentText}
        onChange={(e: any) => setBulkCommentText(e.target.value)}
        style={{ width: '100%', minHeight: '120px', padding: '10px', fontSize: '13px' }}
      />
    </El>

    {/* Selected Queue Summary Panel Card */}
    <El style={{ background: '#f5f5f5', borderRadius: '4px', padding: '12px', border: '1px solid #e8e8e8' }}>
      <span style={{ fontSize: '11px', color: '#666', fontWeight: 700 }}>
        TARGET TRACKING REFERENCE IDS:
      </span>
      <El style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
        {selectedRowIds.map(id => (
          <span 
            key={id} 
            style={{ fontSize: '11px', background: '#002D72', color: '#fff', padding: '2px 6px', borderRadius: '2px' }}
          >
            #{id}
          </span>
        ))}
      </El>
    </El>
  </El>
</Modal>



