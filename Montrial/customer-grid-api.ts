this.customerSearchService.searchCustomers(criteria).subscribe(
    (response: any) => {
      this.customerGridData = response;
  
      const profiles = response?.profiles ?? [];
      this.errorsObject.message = profiles.length === 0
        ? 'No records retreived !'
        : '';
  
      this.cdr.detectChanges();
    },
    (error: any) => {
      console.error('Error:', error);
      this.errorsObject.message = 'No records retreived !';
      this.cdr.detectChanges();
    }
  );