import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ServiceNavigationComponent } from 'src/app/shared/header/service-navigation/service-navigation.component';

@Component({
  selector: 'app-service-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ServiceNavigationComponent],
  templateUrl: './service-layout.component.html',
  styleUrl: './service-layout.component.scss'
})
export class ServiceLayoutComponent {

}
