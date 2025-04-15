import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgZorroModule } from 'src/app/ng-zorro.module';
import { ValidatePasswordContentComponent } from "./validate-password-content/validate-password-content.component";

@Component({
  selector: 'app-validate-password',
  standalone: true,
  imports: [NgZorroModule, CommonModule, RouterModule, ValidatePasswordContentComponent],
  templateUrl: './validate-password.component.html',
  styleUrl: './validate-password.component.scss'
})
export class ValidatePasswordComponent {

}
