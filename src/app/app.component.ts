import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NgZorroModule } from './ng-zorro.module';
import { IconsProviderModule } from './icons-provider.module';

@Component({
   selector: 'app-root',
   standalone: true,
   imports: [ CommonModule, RouterOutlet, NgZorroModule, IconsProviderModule ],
   templateUrl: './app.component.html',
   styleUrl: './app.component.scss'
})
export class AppComponent {
   title = 'template-login';
}
