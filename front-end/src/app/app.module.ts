import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { PollService } from './option-service/option.service'; for the blockchain
import { CallComponent } from './call-block/call-block.component';
import { TickerComponent } from './ticker/ticker.component';
import { PutBlockComponent } from './put-block/put-block.component';
import { ActionsComponent } from './actions/actions.component';
import { StrikePremDepComponent } from './strike-prem-dep/strike-prem-dep.component';

@NgModule({
  declarations: [
    AppComponent,
    CallComponent,
    TickerComponent,
    PutBlockComponent,
    ActionsComponent,
    StrikePremDepComponent,
  ],
  imports: [
    BrowserModule, FormsModule, ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
