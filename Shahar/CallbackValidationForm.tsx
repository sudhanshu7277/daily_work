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
        // 🚀 Invoke the handler function directly on change
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
          handleContactNumberChange(e.target.value)
        }
        style={{ width: '100%' }}
      />
    </El>
  </El>
</El>

const [contactNumber, setContactNumber] = useState<string>('');

// 🚀 Dedicated Change Handler for Contact Number Validation
const handleContactPhoneNumberChange = (val: string) => {
    const sanitizedVal = val.replace(/[^0-9+\(\)\s-]/g, '');
    setContactNumber(sanitizedVal);
    // ... lookup logic
  };


  const handleContactNameChange = (val: string) => {
    setSelectedContactName(val);
  
    // Normalize input value for a safer lookup
    const normalizedInput = val.trim().toLowerCase();
  
    // Find the party where the constructed name matches what was typed
    const party = dealParties.find(p => {
      const fullName = `${p.firstName} ${p.lastName}`.trim().toLowerCase();
      return fullName === normalizedInput;
    });
  
    // If a matching party is found, set it; otherwise, default to null
    setSelectedParty(party || null);
  };


// 🚀 Clean handler to capture international phone input safely
const handleContactPhoneNumberChange = (val: string) => {
    // 1. Clean invalid characters (only keep numbers, plus, brackets, spaces, hyphens)
    const sanitizedVal = val.replace(/[^0-9+\(\)\s-]/g, '');
  
    // 2. Smart Truncation: Standard E.164 international max limit is 15 digits
    const MAX_DIGITS = 15;
    let digitCount = 0;
    let finalVal = '';
  
    for (const char of sanitizedVal) {
      // If the character is a number, count it towards the 15-digit global cap
      if (/[0-9]/.test(char)) {
        if (digitCount >= MAX_DIGITS) break; 
        digitCount++;
      }
      
      // Add the character (number or valid formatting symbol like +, brackets, space)
      finalVal += char;
    }
  
    // 3. Direct State Update
    setContactNumber(finalVal);
  };