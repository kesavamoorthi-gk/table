import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { DataService } from './data.service';
import { TableComponent } from './shared/table/table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  tableColumns = [
    { key: 'name', label: 'Product name', sortable: true, filterable: true },
    { key: 'category', label: 'Category', sortable: true, filterable: true },
    { key: 'brand', label: 'Brand', sortable: true, filterable: true },
    { key: 'description', label: 'Description', filterable: true },
    { key: 'price', label: 'Price', sortable: true }
  ];

  tableData = [
    { id: 1, name: 'Apple iMac 27"', category: 'PC', brand: 'Apple', description: '300', price: '$2999' },
    { id: 2, name: 'Apple iMac 20"', category: 'PC', brand: 'Apple', description: '200', price: '$1499' },

  ];

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    initFlowbite();
    this.tableData = this.dataService.generateRandomData(500);
  }

  onPageChange(page: number) {
    console.log('Current page:', page);
  }

}
