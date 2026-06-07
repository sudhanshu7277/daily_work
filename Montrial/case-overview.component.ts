get formatPriorityIndicators(): string {
    console.log('checking inside function formatPriorityIndicators : ');

    if (!this.currentCase?.priorityIndicators) return this.isCaseEditable ? "None" : "";

    const indicators = Object.entries(this.currentCase.priorityIndicators)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => {
        // 1. First, capitalize the very first character just in case it's camelCase
        const capitalized = key.charAt(0).toUpperCase() + key.slice(1);
        
        // 2. DYNAMIC SPLIT FIX: Insert a space before any uppercase letter that follows another character
        return capitalized.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
      });

    console.log('indicators array : ');
    console.log(indicators);
    return indicators.length > 0 ? indicators.join(', ') : (this.isCaseEditable ? 'None' : '');
  }

  //////////////////

  get formatSegmentFlags(): string {
    if (!this.currentCase?.segmentFlags) return this.isCaseEditable ? "None" : "";

    const flags = Object.entries(this.currentCase.segmentFlags)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => {
        // 1. Strip the leading "is" prefix if it exists (e.g., "isPrivateBanking" -> "PrivateBanking")
        let cleanKey = key.startsWith('is') ? key.slice(2) : key;

        // 2. Dynamic Split: Insert spaces before every uppercase letter
        let formatted = cleanKey.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

        // 3. Handle specific outliers to match your existing business labels perfectly
        if (formatted === 'Investor Line') return 'Investorline';
        if (formatted === 'Bmo Trust') return 'BMO Trust';

        return formatted;
      });

    return flags.length > 0 ? flags.join(', ') : (this.isCaseEditable ? 'None' : '');
  }