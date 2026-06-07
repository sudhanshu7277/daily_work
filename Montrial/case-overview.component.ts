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