import { Component, OnInit } from '@angular/core';

interface FormData {
  securityNumber: string;
  eventType: string;
  eventValueDate: string;
  eventRecordDate: string;
  entitlement: string;
  paymentType: string;
  paymentMethod: string;
  paymentDate: string;
  paymentAmount: string;
  presenterPosition: string;
  standardPayment: boolean;
  target: boolean;
  creditPayment: boolean;
  fedwire: boolean;
  creditorEntity: string;
  creditorWord: string;
  creditorInformation: string;
  comments: string;
}

@Component({
  selector: 'app-payment-details-form',
  templateUrl: './payment-details-form.component.html',
  styleUrls: ['./payment-details-form.component.css']
})
export class PaymentDetailsFormComponent implements OnInit {
  formData: FormData = {
    securityNumber: '',
    eventType: '',
    eventValueDate: '',
    eventRecordDate: '',
    entitlement: '',
    paymentType: '',
    paymentMethod: '',
    paymentDate: '',
    paymentAmount: '',
    presenterPosition: '',
    standardPayment: false,
    target: false,
    creditPayment: false,
    fedwire: false,
    creditorEntity: '',
    creditorWord: '',
    creditorInformation: '',
    comments: '',
  };

  dropdowns = {
    eventTypes: [] as string[],
    eventValueDates: [] as string[],
    eventRecordDates: [] as string[],
    entitlements: [] as string[],
    paymentTypes: [] as string[],
    paymentMethods: [] as string[],
    creditorWords: [] as string[],
  };

  ngOnInit(): void {
    // Simulating the useEffect logic
    this.dropdowns = {
      eventTypes: ['Event Type 1', 'Event Type 2'],
      eventValueDates: ['2024-06-25', '2024-06-26'],
      eventRecordDates: ['2024-06-20', '2024-06-21'],
      entitlements: ['Entitlement A', 'Entitlement B'],
      paymentTypes: ['Payment Type 1', 'Payment Type 2'],
      paymentMethods: ['Method 1', 'Method 2'],
      creditorWords: ['Word 1', 'Word 2']
    };
  }

  handleSubmit(): void {
    console.log('Form submitted with data:', this.formData);
  }

  // Format date string or fallback
  formatDate(dateStr: any): string {
    if (!dateStr) return '–';
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  // Format empty text fallback
  formatText(text: any): string {
    return text || '–';
  }
}






// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// // import { ApiService } from '../../services/api.service'; 
// import dayjs from 'dayjs'; // Install dayjs if not already: npm install dayjs

// @Component({
//   selector: 'app-payment-details-form',
//   templateUrl: './payment-details-form.component.html',
//   styleUrls: ['./payment-details-form.component.scss'],
// })
// export class PaymentDetailsFormComponent implements OnInit {
//   form!: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     // private apiService: ApiService // Or private http: HttpClient
//   ) {}

//   ngOnInit(): void {
//     // Initialize form with default values and validators
//     this.form = this.fb.group({
//       securityNumber: ['', Validators.required],
//       eventType: ['', Validators.required],
//       eventValueDate: [null, Validators.required],
//       eventRecordDate: [null, Validators.required],
//       entitlement: ['', Validators.required],
//       paymentType: ['', Validators.required],
//       paymentMethod: ['', Validators.required],
//       paymentDate: [null, Validators.required],
//       paymentAmount: ['', Validators.required],
//       presenterPosition: ['', Validators.required],
//       standardPayment: [false],
//       target: [false],
//       creditPayment: [false],
//       fedwire: [false],
//       creditorEntity: ['', Validators.required],
//       creditorWord: ['', Validators.required],
//       creditorInformation: ['', Validators.required],
//     });

//     // Fetch data on mount to pre-populate if available (last entry)
//     // this.fetchData();
//   }

//   private async fetchData(): Promise<void> {
//     try {
//       // const data = await this.apiService.getData().toPromise(); 
//       const data: any = [];
//       // // Or this.http.get('/api/data').toPromise()
//       if (data && data.length > 0) {
//         const lastEntry = data[data.length - 1];
//         Object.keys(lastEntry).forEach(key => {
//           if (['eventValueDate', 'eventRecordDate', 'paymentDate'].includes(key)) {
//             const dateStr = lastEntry[key];
//             const date = dateStr ? dayjs(dateStr, 'MM-DD-YYYY').toDate() : null;
//             // Ensure the date is valid before setting
//             if (date && !isNaN(date.getTime())) {
//               this.form.get(key)?.setValue(date);
//             }
//           } else {
//             this.form.get(key)?.setValue(lastEntry[key]);
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//   }

//   async onSubmit(): Promise<void> {
//     if (this.form.valid) {
//       // Format dates to MM-DD-YYYY string
//       const rawData = this.form.value;
//       const formattedData = {
//         ...rawData,
//         eventValueDate: rawData.eventValueDate ? dayjs(rawData.eventValueDate).format('MM-DD-YYYY') : '',
//         eventRecordDate: rawData.eventRecordDate ? dayjs(rawData.eventRecordDate).format('MM-DD-YYYY') : '',
//         paymentDate: rawData.paymentDate ? dayjs(rawData.paymentDate).format('MM-DD-YYYY') : '',
//       };

//       console.log('Submitted data:', formattedData);

//       // try {
//       //   await this.apiService.postData(formattedData).toPromise(); // Or this.http.post('/api/data', formattedData).toPromise()
//       //   // Reset form to default values
//       //   this.form.reset({
//       //     securityNumber: '',
//       //     eventType: '',
//       //     eventValueDate: null,
//       //     eventRecordDate: null,
//       //     entitlement: '',
//       //     paymentType: '',
//       //     paymentMethod: '',
//       //     paymentDate: null,
//       //     paymentAmount: '',
//       //     presenterPosition: '',
//       //     standardPayment: false,
//       //     target: false,
//       //     creditPayment: false,
//       //     fedwire: false,
//       //     creditorEntity: '',
//       //     creditorWord: '',
//       //     creditorInformation: '',
//       //   });
//       // } catch (error) {
//       //   console.error('Error posting data:', error);
//       // }
//     }
//   }

//   // Helper to check if form is valid (equivalent to React's isValid)
//   get isFormValid(): boolean {
//     return this.form.valid;
//   }
// }