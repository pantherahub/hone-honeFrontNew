import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { TwoFactorAuthContentComponent } from "./two-factor-auth-content/two-factor-auth-content.component";

@Component({
  selector: 'app-two-factor-auth',
  standalone: true,
  imports: [NgZorroModule, CommonModule, TwoFactorAuthContentComponent],
  templateUrl: './two-factor-auth.component.html',
  styleUrl: './two-factor-auth.component.scss'
})
export class TwoFactorAuthComponent {

}
