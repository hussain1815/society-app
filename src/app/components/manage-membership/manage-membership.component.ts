import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MembershipService } from '../../services/membership.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

interface MembershipNumber {
  id: number;
  echs_no: string;
  name: string;
  plots_count: number;
  is_active: boolean;
  created: string;
  modified: string;
}

interface MembershipResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MembershipNumber[];
}

@Component({
  selector: 'app-manage-membership',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './manage-membership.component.html',
  styleUrls: ['./manage-membership.component.scss']
})
export class ManageMembershipComponent implements OnInit {
  private membershipService = inject(MembershipService);
  private dialog = inject(MatDialog);

  memberships: MembershipNumber[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  searchTerm: string = '';
  Math = Math;
  
  showAddDialog: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  isEditMode: boolean = false;
  editingMembershipId: number | null = null;
  originalMembership = {
    echs_no: '',
    name: ''
  };
  newMembership = {
    echs_no: '',
    name: ''
  };

  constructor() {}

  ngOnInit(): void {
    this.loadMemberships();
  }

  loadMemberships(): void {
    this.membershipService.getMembershipNumbers(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response: MembershipResponse) => {
        console.log('Membership Numbers Response:', response);
        this.memberships = response.results;
        this.totalCount = response.count;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      },
      error: (error) => {
        console.error('Error fetching membership numbers:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadMemberships();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadMemberships();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadMemberships();
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

  toggleStatus(membership: MembershipNumber): void {
    const newState = !membership.is_active;
    const action = newState ? 'activate' : 'deactivate';
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Membership`,
        message: `Are you sure you want to ${action} ${membership.name} (ECHS: ${membership.echs_no})?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.membershipService.updateMembershipStatus(membership.id, newState).subscribe({
          next: () => {
            membership.is_active = newState;
            console.log(`Membership ${action}d successfully`);
          },
          error: (error) => {
            console.error(`Error ${action}ing membership:`, error);
          }
        });
      }
    });
  }

  editMembership(membership: MembershipNumber): void {
    this.showAddDialog = true;
    this.isEditMode = true;
    this.editingMembershipId = membership.id;
    this.errorMessage = '';
    this.newMembership = {
      echs_no: membership.echs_no,
      name: membership.name
    };
    this.originalMembership = {
      echs_no: membership.echs_no,
      name: membership.name
    };
  }

  deleteMembership(membership: MembershipNumber): void {
    // Check if membership has plots
    if (membership.plots_count > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Cannot Delete Membership',
          message: `Cannot delete ${membership.name} (ECHS: ${membership.echs_no}) because they have ${membership.plots_count} plot(s) assigned. Please remove all plots before deleting.`,
          confirmText: 'OK',
          cancelText: ''
        }
      });
      return;
    }

    // Show confirmation dialog for deletion
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Membership',
        message: `Are you sure you want to delete ${membership.name} (ECHS: ${membership.echs_no})? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.membershipService.deleteMembership(membership.id).subscribe({
          next: () => {
            console.log('Membership deleted successfully');
            this.loadMemberships(); // Reload the list
          },
          error: (error) => {
            console.error('Error deleting membership:', error);
            // Show error dialog
            this.dialog.open(ConfirmDialogComponent, {
              width: '400px',
              data: {
                title: 'Delete Failed',
                message: 'Failed to delete membership. Please try again.',
                confirmText: 'OK',
                cancelText: ''
              }
            });
          }
        });
      }
    });
  }

  openAddDialog(): void {
    this.showAddDialog = true;
    this.isEditMode = false;
    this.editingMembershipId = null;
    this.errorMessage = '';
    this.newMembership = {
      echs_no: '',
      name: ''
    };
    this.originalMembership = {
      echs_no: '',
      name: ''
    };
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.isEditMode = false;
    this.editingMembershipId = null;
    this.errorMessage = '';
    this.newMembership = {
      echs_no: '',
      name: ''
    };
    this.originalMembership = {
      echs_no: '',
      name: ''
    };
  }

  submitAddMembership(): void {
    if (!this.newMembership.echs_no || !this.newMembership.name) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    
    if (this.isEditMode && this.editingMembershipId) {
      // Edit mode - PATCH request
      this.membershipService.updateMembership(this.editingMembershipId, this.newMembership).subscribe({
        next: (response) => {
          console.log('Membership updated successfully:', response);
          this.closeAddDialog();
          this.loadMemberships(); // Reload the list
        },
        error: (error) => {
          console.error('Error updating membership:', error);
          this.handleError(error);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      // Add mode - POST request
      this.membershipService.createMembership(this.newMembership).subscribe({
        next: (response) => {
          console.log('Membership created successfully:', response);
          this.closeAddDialog();
          this.loadMemberships(); // Reload the list
        },
        error: (error) => {
          console.error('Error creating membership:', error);
          this.handleError(error);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  handleError(error: any): void {
    // Handle error message from API
    if (error.error && error.error.echs_no) {
      this.errorMessage = error.error.echs_no;
    } else if (error.error && typeof error.error === 'string') {
      this.errorMessage = error.error;
    } else if (error.message) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = 'An error occurred while processing the request.';
    }
    this.isSubmitting = false;
  }

  isFormChanged(): boolean {
    return this.newMembership.echs_no !== this.originalMembership.echs_no ||
           this.newMembership.name !== this.originalMembership.name;
  }
}
