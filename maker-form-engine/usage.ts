// app.component.ts
import { Component } from '@angular/core';
import { FormEngineComponent, FieldDef } from '@citi/maker-form-engine';

@Component({
  selector: 'app-root',
  template: `
    <lib-form-engine 
      [fieldDefs]="myFields" 
      [initialValues]="dummyData"
      (onAction)="handleApiTrigger($event)">
    </lib-form-engine>

    <div class="p-4">
      <lib-form-engine 
        [fieldDefs]="paymentFields" 
        [role]="'MAKER'"
        (onAction)="handleExternalApi($event)">
      </lib-form-engine>
    </div>
  `
})
export class AppComponent {
  myFields: FieldDef[] = [
  { key: 'amount', label: 'Amount', type: 'number', required: true, gridClass: 'col-md-6', placeholder: '0.00' },
  { key: 'swiftCode', label: 'SWIFT Code', type: 'text', required: true, gridClass: 'col-md-6' },
  { 
    key: 'eventType', label: 'Event Type', type: 'select', required: true, gridClass: 'col-md-6',
    options: [
      { label: 'Dividend', value: 'DIV' },
      { label: 'Interest', value: 'INT' },
      { label: 'Redemption', value: 'RED' },
      { label: 'Maturity', value: 'MAT' }
    ]
  },
  { 
    key: 'entitlement', label: 'Entitlement', type: 'select', required: true, gridClass: 'col-md-6',
    options: [
      { label: 'Regular', value: 'REG' },
      { label: 'Special', value: 'SPEC' },
      { label: 'Final', value: 'FIN' }
    ]
  },
  { 
    key: 'intermediarySwiftCode', 
    label: 'Intermediary SWIFT Code', 
    type: 'text', 
    required: true, 
    gridClass: 'col-md-6' 
  },
  { 
    key: 'intermediaryAccountNumber', 
    label: 'Intermediary Account Number', 
    type: 'text', 
    required: true,   
    gridClass: 'col-md-6' 
  },
  { key: 'benfBank', label: 'Beneficiary Bank', type: 'text', required: true, gridClass: 'col-md-6' },
  { key: 'benfAccountNumber', label: 'Beneficiary Account Number', type: 'text', required: true, gridClass: 'col-md-6' },
  { key: 'benfSwiftCode', label: 'Beneficiary SWIFT Code', type: 'text', required: false, gridClass: 'col-md-6' },
  { key: 'benfAddress', label: 'Beneficiary Address', type: 'textarea', required: false, gridClass: 'col-12' },
  { key: 'remittanceDetails', label: 'Remittance Details', type: 'textarea', required: false, gridClass: 'col-12' },
  { key: 'additionalInfo', label: 'Additional Info', type: 'textarea', required: false, gridClass: 'col-12' }
];

  dummyData = { amount: '1500.00', swiftCode: 'BNKUSR33' };

  private prepareCheckerData() {
    // In the future, this data will come from an API response
    const apiResponse = {
      amount: '75000.00',
      swiftCode: 'CITIUS33XXXX',
      eventType: 'DIV',
      intBank: 'CHASE NY',
      abaCode: '021000021',
      remarks: 'Standard quarterly dividend processing.'
    };

    // Map the API values into the fields for the Checker
    this.checkerFields = this.makerFields.map(field => ({
      ...field,
      initialValue: apiResponse[field.key as keyof typeof apiResponse] || ''
    }));
  }

  handleApiTrigger(event: any) {
    console.log('Identifier received from library:', event.identifier);
    // Execute dummy API call using DynamicCrudService here...
  }

  handleApiLogic(event: any) {
    // The library tells you WHAT to do via the identifier
    if (event.identifier === 'VAL_SWIFT') {
      this.crudService.execute({ url: '/api/validate', method: 'GET' }, { code: event.value })
        .subscribe(res => console.log('Bank Data:', res));
    }
  }

  handleExternalApi(event: any) {
    console.log('Identifier emitted from library:', event.identifier);
    // Logic to call external services based on the identifier
  }
}

// add below imports in parent application styles.scss

@import "bootstrap/dist/css/bootstrap.min.css";
@import "@angular/material/prebuilt-themes/indigo-pink.css";