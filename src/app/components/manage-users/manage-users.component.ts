import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { UserService } from '../../services/user.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
  imports: [
    CommonModule, 
    FormsModule, 
    SidebarComponent,
    MatDialogModule
  ],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit {
  users: MemberUser[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  selectedStatus: string = '';
  searchQuery: string = '';
  loading: boolean = false;
  Math = Math; // Make Math available in template

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getMemberUsers(this.selectedStatus, this.currentPage, this.pageSize, this.searchQuery).subscribe({
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

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchQuery = '';
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

  onActiveToggle(user: MemberUser): void {
    const newState = !user.is_active;
    const action = newState ? 'activate' : 'deactivate';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        message: `Are you sure you want to ${action} ${user.full_name}?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUserActiveState(user.id, newState).subscribe({
          next: () => {
            user.is_active = newState;
            console.log(`User ${action}d successfully`);
          },
          error: (error) => {
            console.error(`Error ${action}ing user:`, error);
          }
        });
      }
    });
  }

  onStatusChange(user: MemberUser, newStatus: string): void {
    const oldStatus = user.status;
    
    // If status hasn't changed, do nothing
    if (newStatus === oldStatus) {
      return;
    }
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Change Status',
        message: `Are you sure you want to change ${user.full_name}'s status to ${newStatus}?`,
        confirmText: 'Change Status',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUserStatus(user.id, newStatus).subscribe({
          next: () => {
            console.log('Status updated successfully');
          },
          error: (error) => {
            console.error('Error updating status:', error);
            // Revert status on error
            user.status = oldStatus;
          }
        });
      } else {
        // User cancelled, revert status
        user.status = oldStatus;
      }
    });
  }

  getAvailableStatuses(currentStatus: string): string[] {
    if (currentStatus === 'pending') {
      return ['pending', 'approved', 'rejected'];
    }
    // Once approved or rejected, can only switch between those two
    return ['approved', 'rejected'];
  }
}
