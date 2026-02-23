import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { UserService } from '../../services/user.service';

interface MemberUser {
  id: number;
  membership_number: {
    id: number;
    echs_no: string;
  };
  user_email: string;
  username: string;
  full_name: string;
  plot_no: string[];
  status: string;
  is_active: boolean;
  phone_number: string;
  profile_image: string | null;
  created: string;
  modified: string;
}

interface UserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MemberUser[];
}

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
  users: MemberUser[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  selectedStatus: string = '';
  loading: boolean = false;
  Math = Math; // Make Math available in template

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getMemberUsers(this.selectedStatus, this.currentPage, this.pageSize).subscribe({
      next: (response: UserResponse) => {
        console.log('Member Users Response:', response);
        this.users = response.results;
        this.totalCount = response.count;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  changeStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadUsers();
  }

  nextPage(): void {
    this.currentPage++;
    this.loadUsers();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
