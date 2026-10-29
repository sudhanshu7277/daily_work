//Exact Update in search-customer.component.ts
// Replace lines 137 to 139 with:

lastName: ['', [Validators.required, Validators.maxLength(90), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      middleName: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      firstName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],


      lastName: ['', [Validators.required, Validators.maxLength(90), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      middleName: ['', [Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],
      firstName: ['', [Validators.required, Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)]],


      //In search-customer.component.ts, update line 145 (highlighted in the editor) to add the alphabet-only validator pattern:   

      city: ['', [Validators.maxLength(40), Validators.pattern(/^[a-zA-Z]*$/)]],