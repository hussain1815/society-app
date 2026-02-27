import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PetService } from '../../services/pet.service';

interface Pet {
  id: number;
  member: number;
  member_email: string;
  member_name: string | null;
  membership_number: string;
  pet_type: string;
  pet_type_display: string;
  name: string;
  age: number;
  breed: string | null;
  color: string | null;
  pet_image: string | null;
  description: string;
  created: string;
  modified: string;
}

interface PetResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pet[];
}

@Component({
  selector: 'app-manage-pets',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-pets.component.html',
  styleUrl: './manage-pets.component.scss'
})
export class ManagePetsComponent implements OnInit {
  private petService = inject(PetService);

  pets: Pet[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  searchTerm: string = '';
  expandedPetId: number | null = null;
  Math = Math;

  constructor() {}

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.petService.getPets(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response: PetResponse) => {
        console.log('Pets Response:', response);
        this.pets = response.results;
        this.totalCount = response.count;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      },
      error: (error) => {
        console.error('Error fetching pets:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPets();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadPets();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPets();
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

  toggleAccordion(petId: number): void {
    this.expandedPetId = this.expandedPetId === petId ? null : petId;
  }

  isExpanded(petId: number): boolean {
    return this.expandedPetId === petId;
  }
}
