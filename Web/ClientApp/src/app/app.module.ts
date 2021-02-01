import { BrowserModule, BrowserTransferStateModule, TransferState } from '@angular/platform-browser';
import { Inject, NgModule, Optional } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BackendState, BACKEND_STATE, BACKEND_STATE_KEY, DefaultBackendState } from './backend-state';
import { CallbackComponent } from './callback/callback.component';
import { HomeComponent } from './home/home.component';
import { AuthInterceptorService } from './auth-interceptor.service';
import { JexcelDirective } from './jexcel.directive';
import { GraphComponent } from './graph/graph.component';
import { VisjsDirective } from './visjs.directive';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatInputModule } from '@angular/material/input';

let currentBackendState: BackendState;

@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent,
    HomeComponent,
    JexcelDirective,
    GraphComponent,
    VisjsDirective
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    BrowserTransferStateModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    { provide: BackendState, useFactory: () => currentBackendState }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    ssrState: TransferState,
    @Optional() @Inject(BACKEND_STATE) providedBackendState: BackendState,
  ) {
    currentBackendState = ssrState.get(BACKEND_STATE_KEY, providedBackendState || DefaultBackendState);
    console.log('app.module currentBackendState', currentBackendState);
  }
}
