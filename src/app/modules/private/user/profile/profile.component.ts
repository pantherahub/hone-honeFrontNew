import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgZorroModule } from 'src/app/ng-zorro.module';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgZorroModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
