import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
   selector: 'app-basic-layout',
   standalone: true,
   imports: [ CommonModule, RouterOutlet ],
   templateUrl: './basic-layout.component.html',
   styleUrl: './basic-layout.component.scss'
})
export class BasicLayoutComponent {}
