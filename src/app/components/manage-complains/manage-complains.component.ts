import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../services/complaint.service';

interface Complaint {
  id: number;
  subject: string;
  priority: string;
  priority_display: string;
  status: string;
  status_display: string;
  created: string;
  member_email: string;
  member_name: string | null;
  membership_number: string;
  department_name: string;
}

interface ComplaintResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Complaint[];
}

@Component({
  selector: 'app-manage-complains',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-complains.component.html',
  styleUrl: './manage-complains.component.scss'
})
export class ManageComplainsComponent implements OnInit {
  private complaintService = inject(ComplaintService);

  complaints: Complaint[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  searchTerm: string = '';
  selectedPriority: string = '';
  selectedStatus: string = '';
  expandedComplaintId: number | null = null;
  Math = Math;

  showEditDialog: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  editingComplaintId: number | null = null;

  editComplaint_data = {
    status: '',
    closed_reason: ''
  };

  priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  statusChoices = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  loadComplaints(): void {
    this.complaintService.getComplaints(
      this.currentPage, 
      this.pageSize, 
      this.searchTerm,
      this.selectedPriority,
      this.selectedStatus
    ).subscribe({
      next: (response: ComplaintResponse) => {
        console.log('Complaints Response:', response);
        this.complaints = response.results;
        this.totalCount = response.count;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      },
      error: (error) => {
        console.error('Error fetching complaints:', error);
      }
    });
  }

  onPriorityChange(): void {
    this.currentPage = 1;
    this.loadComplaints();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadComplaints();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadComplaints();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadComplaints();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadComplaints();
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

  toggleAccordion(complaintId: number): void {
    this.expandedComplaintId = this.expandedComplaintId === complaintId ? null : complaintId;
  }

  isExpanded(complaintId: number): boolean {
    return this.expandedComplaintId === complaintId;
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  currentComplaintStatus: string = '';

  editComplaint(complaint: Complaint): void {
    this.editingComplaintId = complaint.id;
    this.currentComplaintStatus = complaint.status;
    this.showEditDialog = true;
    this.errorMessage = '';
    
    this.editComplaint_data = {
      status: complaint.status,
      closed_reason: ''
    };
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.errorMessage = '';
    this.editingComplaintId = null;
    this.currentComplaintStatus = '';
  }

  isClosedStatus(): boolean {
    return this.editComplaint_data.status === 'closed';
  }

  getAvailableStatuses(): { value: string; label: string }[] {
    const statusOrder = ['pending', 'in_progress', 'resolved', 'closed'];
    const currentIndex = statusOrder.indexOf(this.currentComplaintStatus);
    
    // Return only statuses that are current or forward
    return this.statusChoices.filter(status => {
      const statusIndex = statusOrder.indexOf(status.value);
      return statusIndex >= currentIndex;
    });
  }

  submitEditComplaint(): void {
    if (!this.editComplaint_data.status) {
      this.errorMessage = 'Please select a status.';
      return;
    }

    // Validate status progression
    const statusOrder = ['pending', 'in_progress', 'resolved', 'closed'];
    const currentIndex = statusOrder.indexOf(this.currentComplaintStatus);
    const newIndex = statusOrder.indexOf(this.editComplaint_data.status);
    
    if (newIndex < currentIndex) {
      this.errorMessage = 'Cannot move status backwards. Status can only progress forward.';
      return;
    }

    if (this.isClosedStatus() && !this.editComplaint_data.closed_reason) {
      this.errorMessage = 'Reason is required when closing a complaint.';
      return;
    }

    if (!this.editingComplaintId) {
      this.errorMessage = 'Complaint ID is missing.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: any = {
      status: this.editComplaint_data.status
    };

    if (this.isClosedStatus() && this.editComplaint_data.closed_reason) {
      payload.closed_reason = this.editComplaint_data.closed_reason;
    }

    this.complaintService.updateComplaintStatus(this.editingComplaintId, payload).subscribe({
      next: (response) => {
        console.log('Complaint updated successfully:', response);
        this.closeEditDialog();
        this.loadComplaints();
      },
      error: (error) => {
        console.error('Error updating complaint:', error);
        if (error.error && typeof error.error === 'object') {
          this.errorMessage = JSON.stringify(error.error);
        } else {
          this.errorMessage = 'An error occurred while updating the complaint.';
        }
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}
