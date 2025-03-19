import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {

  constructor(
    private router: Router,
    private messageService: NzMessageService,
  ) { }

  ngOnInit(): void {
    // Test
    this.messageService.create('success', 'Email verificado.');
    this.onSubmit();
  }

  onSubmit() {
    localStorage.removeItem('requiresEmailVerification');
    localStorage.setItem('requiresPasswordReset', 'true');
    this.router.navigateByUrl('reset-password');
  }

}
