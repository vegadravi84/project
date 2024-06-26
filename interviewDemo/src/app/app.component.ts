import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { Product } from './model/product'; // Assuming Product model is correctly defined in './model/product'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'] // Adjust your SCSS file path as needed
})
export class AppComponent implements OnInit {
  products: Product[] = [];
  productDialog: boolean = false;
  productForm: FormGroup;
  submitted: boolean = false;
  product: Product | any; // Use Product type or any as fallback

  chartData: any[] = [];
  categories: SelectItem[] = [
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Clothing', value: 'Clothing' },
    { label: 'Books', value: 'Books' },
    { label: 'Furniture', value: 'Furniture' },
    { label: 'Toys', value: 'Toys' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    
    this.productForm = this.formBuilder.group({
      id: [null], 
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]], 
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts(); 
  }

  loadProducts() {
    const products = localStorage.getItem('products');
    if (products) {
      this.products = JSON.parse(products);
      this.updateChart(); 
    }
  }

  saveProducts() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  openNew() {
    this.productForm.reset(); 
    this.product = { id: null, name: '', price: 0, category: '' };
    this.productDialog = true; 
    this.submitted = false;
  }

  editProduct(product: Product) {
    this.product = { ...product }; 
    this.productForm.patchValue(product); 
    this.productDialog = true; 
  }

  // Delete a product
  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${product.name}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(p => p.id !== product.id); 
        this.updateChart(); 
        this.saveProducts(); 
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 }); 
      }
    });
  }

  hideDialog() {
    this.productDialog = false; 
    this.submitted = false; 
  }

  saveProduct() {
    this.submitted = true; 

    if (this.productForm.invalid) {
      return; 
    }

    const product = this.productForm.value; 
    if (product.id) {
      const index = this.products.findIndex(p => p.id === product.id);
      this.products[index] = product;
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 }); 
    } else {
      product.id = this.products.length ? Math.max(...this.products.map(p => p.id)) + 1 : 1; 
      this.products.push(product); // Add new product to array
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
    }

    this.updateChart(); 
    this.saveProducts(); 
    this.productDialog = false; 
    this.productForm.reset();
  }

  updateChart() {
    this.chartData = this.products.map(product => ({
      name: product.name,
      value: product.price
    }));
  }
}
