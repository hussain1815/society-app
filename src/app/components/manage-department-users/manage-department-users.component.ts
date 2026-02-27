import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DepartmentUserService } from '../../services/department-user.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

interface DepartmentUser {
  id: number;
  email: string;
  full_name: string;
  department_name: string | null;
  gender: string;
  age: string;
}

interface DepartmentUserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DepartmentUser[];
}

@Component({
  selector: 'app-manage-department-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-department-users.component.html',
  styleUrls: ['./manage-department-users.component.scss']
})
export class ManageDepartmentUsersComponent implements OnInit {
  private departmentUserService = inject(DepartmentUserService);
  private dialog = inject(MatDialog);

  users: DepartmentUser[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  searchTerm: string = '';
  selectedGender: string = '';
  isLoading: boolean = false;
  Math = Math;

  showAddDialog: boolean = false;
  showEditDialog: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  isEditMode: boolean = false;
  editingUserId: number | null = null;

  newUser = {
    email: '',
    first_name: '',
    last_name: '',
    gender: 'male',
    dob: '',
    phone_number: '',
    cnic: ''
  };

  editUser_data = {
    email: '',
    first_name: '',
    last_name: '',
    gender: 'male',
    dob: '',
    phone_number: '',
    cnic: ''
  };

  originalEditData: any = {};

  genderOptions = [
    { value: '', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  genderChoices = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.departmentUserService.getDepartmentUsers(this.currentPage, this.pageSize, this.searchTerm, this.selectedGender).subscribe({
      next: (response: DepartmentUserResponse) => {
        console.log('Department Users Response:', response);
        this.users = response.results;
        this.totalCount = response.count;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching department users:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  onGenderChange(gender: string): void {
    this.selectedGender = gender;
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadUsers();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getGenderColor(gender: string): string {
    return gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
  }

  openAddDialog(): void {
    this.showAddDialog = true;
    this.errorMessage = '';
    this.newUser = {
      email: '',
      first_name: '',
      last_name: '',
      gender: 'male',
      dob: '',
      phone_number: '',
      cnic: ''
    };
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.errorMessage = '';
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  submitAddUser(): void {
    if (!this.newUser.email || !this.newUser.first_name || 
        !this.newUser.last_name || !this.newUser.gender) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Validate CNIC if provided - numbers only
    if (this.newUser.cnic) {
      const cnicDigits = this.newUser.cnic.replace(/\D/g, '');
      if (!/^\d+$/.test(cnicDigits)) {
        this.errorMessage = 'CNIC must contain only numbers.';
        return;
      }
    }

    // Validate phone number if provided - numbers only
    if (this.newUser.phone_number) {
      const phoneDigits = this.newUser.phone_number.replace(/\D/g, '');
      if (!/^\d+$/.test(phoneDigits)) {
        this.errorMessage = 'Phone number must contain only numbers.';
        return;
      }
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare payload - only include non-empty optional fields
    const payload: any = {
      email: this.newUser.email,
      first_name: this.newUser.first_name,
      last_name: this.newUser.last_name,
      gender: this.newUser.gender
    };

    if (this.newUser.dob) payload.dob = this.newUser.dob;
    if (this.newUser.phone_number) payload.phone_number = this.newUser.phone_number;
    if (this.newUser.cnic) payload.cnic = this.newUser.cnic;

    this.departmentUserService.createUser(payload).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        this.closeAddDialog();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.handleError(error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  handleError(error: any): void {
    if (error.error) {
      if (typeof error.error === 'string') {
        this.errorMessage = error.error;
      } else if (error.error.email) {
        this.errorMessage = error.error.email;
      } else if (error.error.detail) {
        this.errorMessage = error.error.detail;
      } else {
        this.errorMessage = JSON.stringify(error.error);
      }
    } else if (error.message) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = 'An error occurred while creating the user.';
    }
    this.isSubmitting = false;
  }

  editUser(user: DepartmentUser): void {
    console.log('Edit user:', user);
    this.isEditMode = true;
    this.editingUserId = user.id;
    this.showEditDialog = true;
    this.errorMessage = '';
    
    // Fetch full user details
    this.departmentUserService.getUserById(user.id).subscribe({
      next: (response) => {
        console.log('User details:', response);
        
        // Populate edit form with user data
        this.editUser_data = {
          email: response.email || '',
          first_name: response.first_name || '',
          last_name: response.last_name || '',
          gender: response.gender || 'male',
          dob: response.dob || '',
          phone_number: response.phone_number || '',
          cnic: response.cnic || ''
        };

        // Store original data for change detection
        this.originalEditData = JSON.parse(JSON.stringify(this.editUser_data));
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        this.errorMessage = 'Failed to load user details. Please try again.';
      }
    });
  }

  deleteUser(user: DepartmentUser): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.full_name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.departmentUserService.deleteUser(user.id).subscribe({
          next: (response) => {
            console.log('User deleted successfully:', response);
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
          }
        });
      }
    });
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.isEditMode = false;
    this.editingUserId = null;
    this.errorMessage = '';
  }

  hasEditChanges(): boolean {
    return JSON.stringify(this.editUser_data) !== JSON.stringify(this.originalEditData);
  }

  submitEditUser(): void {
    if (!this.editUser_data.email || !this.editUser_data.first_name || 
        !this.editUser_data.last_name || !this.editUser_data.gender) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Validate CNIC if provided - numbers only
    if (this.editUser_data.cnic) {
      const cnicDigits = this.editUser_data.cnic.replace(/\D/g, '');
      if (!/^\d+$/.test(cnicDigits)) {
        this.errorMessage = 'CNIC must contain only numbers.';
        return;
      }
    }

    // Validate phone number if provided - numbers only
    if (this.editUser_data.phone_number) {
      const phoneDigits = this.editUser_data.phone_number.replace(/\D/g, '');
      if (!/^\d+$/.test(phoneDigits)) {
        this.errorMessage = 'Phone number must contain only numbers.';
        return;
      }
    }

    if (!this.editingUserId) {
      this.errorMessage = 'User ID is missing.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare payload - only include non-empty fields
    const payload: any = {
      email: this.editUser_data.email,
      first_name: this.editUser_data.first_name,
      last_name: this.editUser_data.last_name,
      gender: this.editUser_data.gender
    };

    if (this.editUser_data.dob) payload.dob = this.editUser_data.dob;
    if (this.editUser_data.phone_number) payload.phone_number = this.editUser_data.phone_number;
    if (this.editUser_data.cnic) payload.cnic = this.editUser_data.cnic;

    this.departmentUserService.updateUser(this.editingUserId, payload).subscribe({
      next: (response) => {
        console.log('User updated successfully:', response);
        this.closeEditDialog();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.handleError(error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
