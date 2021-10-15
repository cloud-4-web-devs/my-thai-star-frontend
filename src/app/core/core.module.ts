import {NgModule} from '@angular/core';
import {AppHeaderComponent} from './components/app-header/app-header.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  declarations: [
    AppHeaderComponent
  ],
  exports: [
    AppHeaderComponent
  ],
  imports: [
    SharedModule
  ]
})
export class CoreModule {
}
