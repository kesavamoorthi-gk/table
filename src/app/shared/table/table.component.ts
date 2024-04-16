// table.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';

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
  imports: [CommonModule],
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

  private searchTextSubject = new Subject<string>();

  constructor() {
    this.searchTextSubject.pipe(debounceTime(300)).subscribe((text) => {
      this.filterText = text;
      this.currentPage = 1;
      this.pageChange.emit(this.currentPage);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.currentPage = this.initialPage;
    }
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
    this.pageChange.emit(this.currentPage);
  }

  getFilteredData(): TableData[] {
    let filteredData = this.data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(this.filterText.toLowerCase())
      )
    );

    if (this.sortColumn) {
      filteredData = filteredData.sort((a, b) => {
        const x = a[this.sortColumn];
        const y = b[this.sortColumn];
        return this.sortDirection === 'asc' ? (x < y ? -1 : x > y ? 1 : 0) : (x < y ? 1 : x > y ? -1 : 0);
      });
    }

    return filteredData;
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.getFilteredData().length / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
}