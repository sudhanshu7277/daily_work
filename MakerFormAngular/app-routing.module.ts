import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentDetailsFormComponent } from './payment-details-form/payment-details-form.component';

const routes: Routes = [
  { 
    path: 'payment-details', 
    component: PaymentDetailsFormComponent 
  },
  // Default route redirects to the payment form
  { 
    path: '', 
    redirectTo: '/payment-details', 
    pathMatch: 'full' 
  },
  // Wildcard route for 404 handling (optional)
  { 
    path: '**', 
    redirectTo: '/payment-details' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule] 
})
export class AppRoutingModule { }






// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { PaymentDetailsFormComponent } from './payment-details-form/payment-details-form.component';

// const routes: Routes = [
//   { 
//     path: 'payment-details', 
//     component: PaymentDetailsFormComponent 
//   },
//   // Redirect empty path to payment-details or a home component
//   { path: '', redirectTo: '/payment-details', pathMatch: 'full' }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }