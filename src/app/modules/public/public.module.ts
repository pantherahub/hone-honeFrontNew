import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroModule } from '../../ng-zorro.module';
import { LoginComponent } from './login/login.component';
import { RecaptchaV3Module, RecaptchaFormsModule, RECAPTCHA_SETTINGS } from 'ng-recaptcha';
import { environment } from '../../../environments/environment.development';
import { FormsModule } from '@angular/forms';

@NgModule({
   declarations: [],
   imports: [ CommonModule ]
})
export class PublicModule {}
