import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  generateRandomData(numEntries: number) {
    const tableData = [];
    const categories = ['PC', 'Laptop', 'Tablet', 'Smartphone'];
    const brands = ['Apple', 'Samsung', 'Dell', 'HP', 'Lenovo', 'Asus'];
    const descriptions = ['Excellent condition', 'Good condition', 'Used condition', 'Refurbished'];
    const maxPrice = 5000;

    for (let i = 1; i <= numEntries; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      const randomPrice = `$${Math.floor(Math.random() * maxPrice) + 500}`;

      const dataEntry = {
        id: i,
        name: `${randomBrand} ${randomCategory} ${i}"`,
        category: randomCategory,
        brand: randomBrand,
        description: randomDescription,
        price: randomPrice,
      };

      tableData.push(dataEntry);
    }

    return tableData;
  }
}
