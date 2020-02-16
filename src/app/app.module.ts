import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HereMapsModule } from 'ng2-heremaps';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    FormsModule,
    HereMapsModule.forRoot({
      apiKey: '9n-DSggWgGyXgJdXjvaOs0qSohBoLe14pDuZ_rZJ4-0',
      appId: 'TajRe5OLoFFcq1kgWHgQ',
      apiVersion: '3.0',
      libraries: ['core', 'service']
    }),
    BrowserModule,
    AppRoutingModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
