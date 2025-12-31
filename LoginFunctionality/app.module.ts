import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthInterceptor } from './shared/interceptors/auth.interceptor'; // Your class-based interceptor

// Standalone components (import them here)
import { GlobalHeaderComponent } from './shared/components/global-header/global-header.component';

@NgModule({
  declarations: [
    AppComponent // Non-standalone
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,

    // Standalone components
    GlobalHeaderComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // ← Required for interceptors
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }