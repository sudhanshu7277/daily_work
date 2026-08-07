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



  // retur provinces

  export interface Province {
    countryCode: string;
    code: string;
    name: string;
  }
  
  /**
   * Finds a province/state by name and returns its corresponding code (e.g., "CT" for "Connecticut").
   * Performs a case-insensitive search.
   */
  getProvinceCodeByName(selectedProvinceName: string): string | null {
    if (!selectedProvinceName || !this.provincesList?.length) {
      return null;
    }
  
    const matchedProvince = this.provincesList.find(
      (province: Province) => province.name.toLowerCase() === selectedProvinceName.trim().toLowerCase()
    );
  
    return matchedProvince ? matchedProvince.code : null;
  }