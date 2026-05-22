import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../../ui/buttons/button/button.component';
import { environment } from 'src/environments/environment';
import { ModalComponent } from '../../../ui/overlays/modal/modal.component';

@Component({
  selector: 'app-tutorial-video',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './tutorial-video.component.html',
  styleUrl: './tutorial-video.component.scss'
})
export class TutorialVideoComponent {

  @Input() isTutorial: boolean = false;

  videoUrl = `${environment.s3AssetsHost}Hone+Solutions+Lissom+2025+1080p+Hi.mp4`;

  constructor(
    private modalRef: ModalComponent,
  ) { }

  closeModal(): void {
    this.modalRef.close();
  }

}
