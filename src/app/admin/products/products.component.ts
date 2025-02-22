import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = []; // Store categories for dropdown
  loading = true;
  productForm: FormGroup;
  editMode = false;
  selectedProductId: number | null = null;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      singleUnitPrice: [0, [Validators.required, Validators.min(0)]],
      bulkUnitPrice: [0, [Validators.required, Validators.min(0)]],
      bulkQuantity: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required], // Changed to null initially
      description: ['']
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories(); // Load categories on init
  }

  loadProducts() {
    this.authService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadCategories() {
    this.authService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  openCreateModal() {
    this.editMode = false;
    this.selectedProductId = null;
    this.productForm.reset({ categoryId: null }); // Reset with null categoryId
  }

  openEditModal(product: any) {
    this.editMode = true;
    this.selectedProductId = product.id;
    this.productForm.patchValue(product);
  }

  onSubmit() {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      if (this.editMode && this.selectedProductId) {
        this.authService.updateProduct(this.selectedProductId, productData).subscribe({
          next: () => {
            this.loadProducts();
            this.closeModal();
          },
          error: (err) => console.error('Update failed:', err)
        });
      } else {
        this.authService.createProduct(productData).subscribe({
          next: () => {
            this.loadProducts();
            this.closeModal();
          },
          error: (err) => console.error('Create failed:', err)
        });
      }
    }
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.authService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error('Delete failed:', err)
      });
    }
  }

  closeModal() {
    const modal = document.getElementById('productModal') as HTMLDivElement;
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  }
}