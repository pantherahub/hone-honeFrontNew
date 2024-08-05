import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgZorroModule } from '../../../../ng-zorro.module';

@Component({
  selector: 'app-tutorial-video',
  standalone: true,
  imports: [NgZorroModule],
  templateUrl: './tutorial-video.component.html',
  styleUrl: './tutorial-video.component.scss'
})
export class TutorialVideoComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {

  }

  closeVideo(): void {
    this.router.navigateByUrl('home');
  }

}
