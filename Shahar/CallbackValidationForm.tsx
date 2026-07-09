<El className="lmn-row">
  {/* 1. Contact Name - Converted to Input Field */}
  <El className="lmn-col-sm-3">
    <El className="lmn-form-group" style={{ marginBottom: '16px' }}>
      <label className="lmn-form-label lmn-required">Contact Name</label>
      <Input
        placeholder="Enter Contact Name"
        value={selectedContactName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
          handleContactNameChange(e.target.value)
        }
        style={{ width: '100%' }}
      />
    </El>
  </El>
</El>

<El className="lmn-row">
  {/* Contact Number Field Container */}
  <El className="lmn-col-sm-3">
    <El className="lmn-form-group" style={{ marginBottom: '16px' }}>
      <label className="lmn-form-label lmn-required">Contact Number</label>
      <Input
        placeholder="e.g., +1 (432) 123 1234"
        value={contactNumber}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const rawValue = e.target.value;

          // 🚀 REGEX STRIPPER: Removes everything EXCEPT numbers, brackets, plus sign, and spaces
          const sanitizedValue = rawValue.replace(/[^0-9+\(\)\s-]/g, '');

          // Sets the clean state hook only
          setContactNumber(sanitizedValue);
        }}
        style={{ width: '100%' }}
      />
    </El>
  </El>
</El>

const [contactNumber, setContactNumber] = useState<string>('');