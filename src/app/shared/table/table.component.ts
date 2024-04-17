import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
}

interface TableData {
  [key: string]: any;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {
  @Input() columns: TableColumn[];
  @Input() data: TableData[];
  @Input() pageSize: number = 10;
  @Input() initialPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  currentPage: number = this.initialPage;
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  filterText: string = '';

  private searchTextSubject = new BehaviorSubject<string>('');
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
  selectedBrand: string = '';
  brandFilter = new FormControl('');

  constructor() {
    this.searchTextSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((text) => {
      this.filterText = text;
      this.currentPage = 1;
      this.updatePaginationState();
      this.pageChange.emit(this.currentPage);
    });
    // Subscribe to changes in the brand filter dropdown
    this.brandFilter.valueChanges.pipe(
      distinctUntilChanged() // Only emit distinct values
    ).subscribe((brand: string) => {
      this.selectedBrand = brand; // Update selectedBrand when dropdown value changes
      this.currentPage = 1; // Reset to first page when filter changes
      this.updatePaginationState(); // Update pagination state
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.currentPage = this.initialPage;
      this.updatePaginationState();
    }
  }
  onBrandFilterChange() {
    const selectedBrand = this.brandFilter.value;
    // Filter data based on the selected brand
    this.searchTextSubject.next(selectedBrand);
  }

  getCategoryBrands(): string[] {
    // return ['Apple', 'Samsung']
    const brandsSet = new Set<string>();
    this.data.forEach(item => {
      brandsSet.add(item['brand']);
    });
    return Array.from(brandsSet);
  }

  onSearch(event: Event) {
    this.searchTextSubject.next((event.target as HTMLInputElement).value);
  }

  onSort(column: TableColumn) {
    if (column.sortable) {
      if (this.sortColumn === column.key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column.key;
        this.sortDirection = 'asc';
      }
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePaginationState();
    this.pageChange.emit(this.currentPage);

  }

  getFilteredData(): TableData[] {
    let filteredData = this.data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(this.filterText.toLowerCase())
      )
    );
    // Apply brand filter if selectedBrand is not empty
    if (this.selectedBrand) {
      filteredData = filteredData.filter(item => item['brand'] === this.selectedBrand);
    }


    if (this.sortColumn) {
      filteredData = filteredData.sort((a, b) => {
        const x = a[this.sortColumn!];
        const y = b[this.sortColumn!];
        return this.sortDirection === 'asc' ? (x === y ? 0 : x < y ? -1 : 1) : (x === y ? 0 : x < y ? 1 : -1);
      });
    }


    return filteredData;
  }

  getPageNumbers(): number[] {
    const filteredData = this.getFilteredData();

    const totalPages = Math.ceil(filteredData.length / this.pageSize);

    const maxPages = Math.min(totalPages, 10); // Max pages to display initially

    let startPage: number;
    let endPage: number;

    if (totalPages <= maxPages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
      let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
      if (this.currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPages;
      } else if (this.currentPage + maxPagesAfterCurrentPage >= totalPages) {
        startPage = totalPages - maxPages + 1;
        endPage = totalPages;
      } else {
        startPage = this.currentPage - maxPagesBeforeCurrentPage;
        endPage = this.currentPage + maxPagesAfterCurrentPage;
      }
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    // return Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);
  }

  updatePaginationState() {
    const filteredData = this.getFilteredData();
    const totalPages = Math.ceil(filteredData.length / this.pageSize);

    this.hasNextPage = this.currentPage < totalPages;
    this.hasPreviousPage = this.currentPage > 1;
  }
}
