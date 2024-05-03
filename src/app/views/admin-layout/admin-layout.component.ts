import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-admin-layout',
   standalone: true,
   imports: [ HeaderComponent, CommonModule, RouterOutlet ],
   templateUrl: './admin-layout.component.html',
   styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {}
