import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PlotService } from '../../services/plot.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

interface MembershipNumber {
  id: number;
  echs_no: string;
  name: string;
  is_active: boolean;
}

interface Plot {
  id: number;
  plot_no: string;
  possession_date: string;
  plot_type: string;
  plot_status: string;
  membership_numbers: MembershipNumber[];
  total_active_membership: number;
  covered_area: string;
  street_no: string | null;
  block: string | null;
  sector: string | null;
  house_no: string | null;
  plaza_no: string | null;
  created: string;
  modified: string;
}

interface PlotResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Plot[];
}

@Component({
  selector: 'app-manage-plots',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './manage-plots.component.html',
  styleUrls: ['./manage-plots.component.scss']
})
export class ManagePlotsComponent implements OnInit {
  private plotService = inject(PlotService);
  private dialog = inject(MatDialog);

  plots: Plot[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  selectedStatus: string = '';
  selectedType: string = '';
  searchTerm: string = '';
  expandedIndex: number | null = null;
  Math = Math;

  showAddDialog: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  isEditMode: boolean = false;
  editingPlotId: number | null = null;
  membershipNumbers: any[] = [];
  filteredMembershipNumbers: any[] = [];
  membershipSearchTerm: string = '';
  showMembershipDropdown: boolean = false;
  selectedMembers: any[] = [];
  
  newPlot = {
    plot_no: '',
    possession_date: '',
    plot_type: 'Residential',
    plot_status: 'Only Possession',
    membership_number_ids: [] as number[],
    covered_area: '',
    street_no: '',
    block: '',
    sector: '',
    house_no: '',
    plaza_no: ''
  };

  plotStatuses = [
    { value: '', label: 'All' },
    { value: 'Only Possession', label: 'Only Possession' },
    { value: 'UnderConstruction', label: 'Under Construction' },
    { value: 'Completed', label: 'Completed' }
  ];

  plotStatusChoices = [
    { value: 'Only Possession', label: 'Only Possession' },
    { value: 'UnderConstruction', label: 'Under Construction' },
    { value: 'Completed', label: 'Completed' }
  ];

  plotTypes = [
    { value: '', label: 'All' },
    { value: 'Residential', label: 'Residential' },
    { value: 'Commercial', label: 'Commercial' }
  ];

  plotTypeChoices = [
    { value: 'Residential', label: 'Residential' },
    { value: 'Commercial', label: 'Commercial' }
  ];

  constructor() {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.membership-dropdown-container')) {
      this.showMembershipDropdown = false;
    }
  }

  ngOnInit(): void {
    this.loadPlots();
  }

  loadPlots(): void {
    this.plotService.getPlots(this.currentPage, this.pageSize, this.selectedStatus, this.selectedType, this.searchTerm).subscribe({
      next: (response: PlotResponse) => {
        console.log('Plots Response:', response);
        this.plots = response.results;
        this.totalCount = response.count;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      },
      error: (error) => {
        console.error('Error fetching plots:', error);
      }
    });
  }

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadPlots();
  }

  onTypeChange(type: string): void {
    this.selectedType = type;
    this.currentPage = 1;
    this.loadPlots();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPlots();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadPlots();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPlots();
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

  toggleAccordion(index: number): void {
    if (this.expandedIndex === index) {
      this.expandedIndex = null;
    } else {
      this.expandedIndex = index;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Only Possession':
        return 'bg-blue-100 text-blue-800';
      case 'UnderConstruction':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusDisplay(status: string): string {
    if (status === 'UnderConstruction') {
      return 'Under Construction';
    }
    return status;
  }

  openAddDialog(): void {
    this.showAddDialog = true;
    this.isEditMode = false;
    this.editingPlotId = null;
    this.errorMessage = '';
    this.selectedMembers = [];
    this.membershipSearchTerm = '';
    this.showMembershipDropdown = false;
    this.newPlot = {
      plot_no: '',
      possession_date: '',
      plot_type: 'Residential',
      plot_status: 'Only Possession',
      membership_number_ids: [],
      covered_area: '',
      street_no: '',
      block: '',
      sector: '',
      house_no: '',
      plaza_no: ''
    };
    
    // Load membership numbers for dropdown
    this.loadMembershipNumbers();
  }

  loadMembershipNumbers(): void {
    this.plotService.getMembershipDropdown().subscribe({
      next: (response) => {
        console.log('Membership Numbers Dropdown:', response);
        this.membershipNumbers = response;
        this.filteredMembershipNumbers = response;
      },
      error: (error) => {
        console.error('Error fetching membership numbers:', error);
      }
    });
  }

  toggleMembershipDropdown(): void {
    this.showMembershipDropdown = !this.showMembershipDropdown;
    if (this.showMembershipDropdown) {
      // Focus on the input when dropdown opens
      setTimeout(() => {
        const input = document.getElementById('membershipSearchInput') as HTMLInputElement;
        if (input) input.focus();
      }, 0);
    }
  }

  onMembershipInputFocus(): void {
    this.showMembershipDropdown = true;
  }

  filterMembershipNumbers(): void {
    const term = this.membershipSearchTerm.toLowerCase();
    if (term) {
      this.filteredMembershipNumbers = this.membershipNumbers.filter(member =>
        member.name.toLowerCase().includes(term) ||
        member.echs_no.toLowerCase().includes(term)
      );
    } else {
      this.filteredMembershipNumbers = this.membershipNumbers;
    }
    this.showMembershipDropdown = true;
  }

  toggleMemberSelection(member: any): void {
    const index = this.selectedMembers.findIndex(m => m.id === member.id);
    if (index > -1) {
      this.selectedMembers.splice(index, 1);
    } else {
      this.selectedMembers.push(member);
    }
    this.updateMembershipIds();
  }

  isMemberSelected(member: any): boolean {
    return this.selectedMembers.some(m => m.id === member.id);
  }

  removeMember(member: any): void {
    const index = this.selectedMembers.findIndex(m => m.id === member.id);
    if (index > -1) {
      this.selectedMembers.splice(index, 1);
      this.updateMembershipIds();
    }
  }

  updateMembershipIds(): void {
    this.newPlot.membership_number_ids = this.selectedMembers.map(m => m.id);
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.isEditMode = false;
    this.editingPlotId = null;
    this.errorMessage = '';
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  submitAddPlot(): void {
    if (!this.newPlot.plot_no || !this.newPlot.plot_type || !this.newPlot.plot_status) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Prepare payload - only include non-empty optional fields
    const payload: any = {
      plot_no: this.newPlot.plot_no,
      plot_type: this.newPlot.plot_type,
      plot_status: this.newPlot.plot_status,
      membership_number_ids: this.newPlot.membership_number_ids // Always include, even if empty
    };

    if (this.newPlot.possession_date) payload.possession_date = this.newPlot.possession_date;
    if (this.newPlot.covered_area) payload.covered_area = this.newPlot.covered_area;
    if (this.newPlot.street_no) payload.street_no = this.newPlot.street_no;
    if (this.newPlot.block) payload.block = this.newPlot.block;
    if (this.newPlot.sector) payload.sector = this.newPlot.sector;
    
    // Only include house_no for Residential or plaza_no for Commercial
    if (this.newPlot.plot_type === 'Residential' && this.newPlot.house_no) {
      payload.house_no = this.newPlot.house_no;
    }
    if (this.newPlot.plot_type === 'Commercial' && this.newPlot.plaza_no) {
      payload.plaza_no = this.newPlot.plaza_no;
    }

    const request = this.isEditMode && this.editingPlotId
      ? this.plotService.updatePlot(this.editingPlotId, payload)
      : this.plotService.createPlot(payload);

    request.subscribe({
      next: (response) => {
        console.log(`Plot ${this.isEditMode ? 'updated' : 'created'} successfully:`, response);
        this.closeAddDialog();
        this.loadPlots();
      },
      error: (error) => {
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} plot:`, error);
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
      } else if (error.error.plot_no) {
        this.errorMessage = error.error.plot_no;
      } else if (error.error.detail) {
        this.errorMessage = error.error.detail;
      } else {
        this.errorMessage = JSON.stringify(error.error);
      }
    } else if (error.message) {
      this.errorMessage = error.message;
    } else {
      this.errorMessage = 'An error occurred while creating the plot.';
    }
    this.isSubmitting = false;
  }

  editPlot(plot: Plot): void {
    this.showAddDialog = true;
    this.isEditMode = true;
    this.editingPlotId = plot.id;
    this.errorMessage = '';
    
    // Populate form with plot data
    this.newPlot = {
      plot_no: plot.plot_no,
      possession_date: plot.possession_date || '',
      plot_type: plot.plot_type,
      plot_status: plot.plot_status,
      membership_number_ids: plot.membership_numbers.map(m => m.id),
      covered_area: plot.covered_area || '',
      street_no: plot.street_no || '',
      block: plot.block || '',
      sector: plot.sector || '',
      house_no: plot.house_no || '',
      plaza_no: plot.plaza_no || ''
    };
    
    // Set selected members
    this.selectedMembers = [...plot.membership_numbers];
    
    // Load membership numbers for dropdown
    this.loadMembershipNumbers();
  }

  deletePlot(plot: Plot): void {
    // Check if plot has members
    if (plot.total_active_membership > 0) {
      this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Cannot Delete Plot',
          message: `Cannot delete plot ${plot.plot_no} because it has ${plot.total_active_membership} member(s) associated. Please remove all members before deleting.`,
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
        title: 'Delete Plot',
        message: `Are you sure you want to delete plot ${plot.plot_no}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.plotService.deletePlot(plot.id).subscribe({
          next: () => {
            console.log('Plot deleted successfully');
            this.loadPlots();
          },
          error: (error) => {
            console.error('Error deleting plot:', error);
            this.dialog.open(ConfirmDialogComponent, {
              width: '400px',
              data: {
                title: 'Delete Failed',
                message: 'Failed to delete plot. Please try again.',
                confirmText: 'OK',
                cancelText: ''
              }
            });
          }
        });
      }
    });
  }
}
