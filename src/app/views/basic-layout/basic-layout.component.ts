import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderPublicComponent } from 'src/app/shared/header/header-public/header-public.component';

@Component({
   selector: 'app-basic-layout',
   standalone: true,
   imports: [ CommonModule, RouterOutlet, HeaderPublicComponent ],
   templateUrl: './basic-layout.component.html',
   styleUrl: './basic-layout.component.scss'
})
export class BasicLayoutComponent {}
