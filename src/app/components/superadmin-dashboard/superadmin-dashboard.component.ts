import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrls: ['./superadmin-dashboard.component.scss']
})
export class SuperadminDashboardComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = `${user.first_name} ${user.last_name}`.trim() || user.email;
      this.userEmail = user.email;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
