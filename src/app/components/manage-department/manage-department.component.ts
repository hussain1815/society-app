import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../services/department.service';

interface Department {
  id: number;
  department_name: string;
  user_email: string;
  user_full_name: string;
  user_id?: number;
  age: string;
  phone_number: string | null;
  profile_image: string | null;
}

interface DepartmentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Department[];
}

@Component({
  selector: 'app-manage-department',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-department.component.html',
  styleUrl: './manage-department.component.scss'
})
export class ManageDepartmentComponent implements OnInit {
  private departmentService = inject(DepartmentService);

  departments: Department[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  searchTerm: string = '';
  isActiveFilter?: boolean;
  isLoading: boolean = false;
  Math = Math;

  showAddDialog: boolean = false;
  showEditDialog: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  departmentUsers: any[] = [];
  editingDepartmentId: number | null = null;
  originalUserId: number | null = null;

  newDepartment = {
    department_name: '',
    user_id: null as number | null,
    password: ''
  };

  editDepartment_data = {
    department_name: '',
    user_id: null as number | null,
    password: ''
  };

  constructor() {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.departmentService.getDepartments(this.currentPage, this.pageSize, this.searchTerm, this.isActiveFilter).subscribe({
      next: (response: DepartmentResponse) => {
        console.log('Departments Response:', response);
        this.departments = response.results;
        this.totalCount = response.count;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadDepartments();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadDepartments();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadDepartments();
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

  openAddDialog(): void {
    this.showAddDialog = true;
    this.errorMessage = '';
    this.showPassword = false;
    this.newDepartment = {
      department_name: '',
      user_id: null,
      password: ''
    };
    
    // Fetch department users for dropdown
    this.departmentService.getDepartmentUsersDropdown().subscribe({
      next: (response) => {
        console.log('Department Users Dropdown:', response);
        this.departmentUsers = response;
      },
      error: (error) => {
        console.error('Error fetching department users:', error);
      }
    });
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.errorMessage = '';
    this.showPassword = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  submitAddDepartment(): void {
    if (!this.newDepartment.department_name || !this.newDepartment.user_id || !this.newDepartment.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.newDepartment.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      department_name: this.newDepartment.department_name,
      user_id: this.newDepartment.user_id,
      password: this.newDepartment.password
    };

    this.departmentService.createDepartment(payload).subscribe({
      next: (response) => {
        console.log('Department created successfully:', response);
        this.closeAddDialog();
        this.loadDepartments();
      },
      error: (error) => {
        console.error('Error creating department:', error);
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
      } else if (error.error.department_name) {
        this.errorMessage = error.error.department_name;
      } else if (error.error.detail) {
        this.errorMessage = error.error.detail;
      } else {
        this.errorMessage = JSON.stringify(error.error);
      }
    } else if (error.message) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = 'An error occurred while creating the department.';
    }
    this.isSubmitting = false;
  }

  editDepartment(dept: Department): void {
    console.log('Edit department:', dept);
    this.editingDepartmentId = dept.id;
    this.showEditDialog = true;
    this.errorMessage = '';
    this.showPassword = false;
    
    // Fetch department details first
    this.departmentService.getDepartmentById(dept.id).subscribe({
      next: (response) => {
        console.log('Department details:', response);
        
        // Extract user_id from response
        let userId = response.user_id || null;
        
        this.editDepartment_data = {
          department_name: response.department_name || '',
          user_id: userId,
          password: ''
        };
        
        // Store original user_id to detect changes
        this.originalUserId = userId;
        
        // Fetch department users dropdown with user_id filter
        if (userId) {
          this.departmentService.getDepartmentUsersDropdown(userId).subscribe({
            next: (users) => {
              console.log('Department Users Dropdown:', users);
              this.departmentUsers = users;
            },
            error: (error) => {
              console.error('Error fetching department users:', error);
            }
          });
        } else {
          // If no user_id, fetch all users
          this.departmentService.getDepartmentUsersDropdown().subscribe({
            next: (users) => {
              console.log('Department Users Dropdown:', users);
              this.departmentUsers = users;
            },
            error: (error) => {
              console.error('Error fetching department users:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error fetching department details:', error);
        this.errorMessage = 'Failed to load department details. Please try again.';
      }
    });
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.errorMessage = '';
    this.showPassword = false;
    this.editingDepartmentId = null;
    this.originalUserId = null;
  }

  hasUserChanged(): boolean {
    // Convert both to numbers for proper comparison
    return Number(this.editDepartment_data.user_id) !== Number(this.originalUserId);
  }

  submitEditDepartment(): void {
    if (!this.editDepartment_data.department_name || !this.editDepartment_data.user_id) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Convert user_id to number for proper comparison
    const selectedUserId = Number(this.editDepartment_data.user_id);
    const userHasChanged = selectedUserId !== this.originalUserId;

    // If user changed, password is required
    if (userHasChanged && !this.editDepartment_data.password) {
      this.errorMessage = 'Password is required when changing the assigned user.';
      return;
    }

    // If password provided, validate length
    if (this.editDepartment_data.password && this.editDepartment_data.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    if (!this.editingDepartmentId) {
      this.errorMessage = 'Department ID is missing.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: any = {
      department_name: this.editDepartment_data.department_name,
      user_id: selectedUserId
    };

    // Only include password if user changed and password is provided
    if (userHasChanged && this.editDepartment_data.password) {
      payload.password = this.editDepartment_data.password;
    }

    this.departmentService.updateDepartment(this.editingDepartmentId, payload).subscribe({
      next: (response) => {
        console.log('Department updated successfully:', response);
        this.closeEditDialog();
        this.loadDepartments();
      },
      error: (error) => {
        console.error('Error updating department:', error);
        this.handleError(error);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  deleteDepartment(dept: Department): void {
    console.log('Delete department:', dept);
    // TODO: Implement delete functionality
  }
}
