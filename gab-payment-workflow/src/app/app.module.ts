import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import the Standalone UI Components
import { SidebarComponent } from './shared/ui/sidebar/sidebar.component';
import { NotificationComponent } from './shared/ui/notification/notification.component';

// Import your NgRx State
import { uiReducer } from './store/ui/ui.reducer';
import { instructionReducer } from './store/instruction/instruction.reducer';
import { InstructionEffects } from './store/instruction/instruction.effects';

@NgModule({
  declarations: [
    AppComponent // Non-standalone root component
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    
    // 🟢 Register Standalone Components Here 🟢
    SidebarComponent,
    NotificationComponent,
    
    StoreModule.forRoot({
      ui: uiReducer,
      instruction: instructionReducer
    }), 
    EffectsModule.forRoot([InstructionEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }