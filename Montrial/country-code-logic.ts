export interface Country {
    countryCode: string;
    countryId: number;
    name: string;
  }
  
  /**
   * Finds a country by name and returns its corresponding countryCode.
   * Performs a case-insensitive search.
   */
  getCountryCodeByName(selectedCountryName: string): string | null {
    if (!selectedCountryName || !this.countriesList?.length) {
      return null;
    }
  
    const matchedCountry = this.countriesList.find(
      (country: Country) => country.name.toLowerCase() === selectedCountryName.trim().toLowerCase()
    );
  
    return matchedCountry ? matchedCountry.countryCode : null;
  }