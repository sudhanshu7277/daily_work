import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import your standalone LoginComponent here
import { LoginComponent } from './features/login/login.component';

@NgModule({
  declarations: [
    AppComponent
    // Do NOT declare LoginComponent if standalone
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // Import standalone LoginComponent as a module if you want to use in router
    LoginComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }