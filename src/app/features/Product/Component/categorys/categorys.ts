import { Component, DestroyRef, EventEmitter, HostListener, inject, OnInit, Output, signal } from '@angular/core';
import { LanguageService } from '../../../../core/services/language-service';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../Service/product-service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../Service/category-service';

@Component({
  imports: [TranslatePipe, CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  selector: 'app-categorys',
  styleUrl: './categorys.scss',
  templateUrl: './categorys.html',
})
export class Categorys implements OnInit {
  @Output() sortChanged = new EventEmitter<string>();
  @Output() searchChanged = new EventEmitter<string>();
  @Output() categorySelected = new EventEmitter<number | null>();

  searchControl = new FormControl('');
  categories = signal<any[]>([]);
  selectedCategoryId = signal<number | null>(null);

  private destroyRef = inject(DestroyRef);
  langService = inject(LanguageService);

  constructor(private _ProductService: ProductService , private categoryService:CategoryService) {}

  ngOnInit(): void {
    this.getCategory();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((searchTerm) => {
        this.searchChanged.emit(searchTerm?.trim() || '');
      });
  }

  getCategory() {
    this._ProductService.getCategory().subscribe({
      next: (res: any) => this.categories.set(res),
      error: (err) => console.error('Error fetching categories', err),
    });
  }

  onSortChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.sortChanged.emit(selectElement.value);
  }

  onCategorySelect(categoryId: number | null) {
    this.selectedCategoryId.set(categoryId);
    this.categorySelected.emit(categoryId);
  }

  categoryToDelete = signal<any | null>(null);
deleting = signal(false);
deleteError = signal<string | null>(null);



openMenuId = signal<number | null>(null);

toggleMenu(id: number, event: Event): void {
  event.stopPropagation(); // عشان الـ document:click ما يقفلهاش فورًا
  this.openMenuId.update((current) => (current === id ? null : id));
}

closeMenu(): void {
  this.openMenuId.set(null);
}

// أي كليك برا الـ kebab يقفل القائمة
@HostListener('document:click')
onDocumentClick(): void {
  this.closeMenu();
}

// Escape يقفل القائمة أولًا، ولو مفيش قائمة مفتوحة يقفل الـ dialog
@HostListener('document:keydown.escape')
onEscape(): void {
  if (this.openMenuId() !== null) {
    this.closeMenu();
    return;
  }
  this.cancelDelete();
}

askDelete(category: any): void {
  this.closeMenu();
  this.deleteError.set(null);
  this.categoryToDelete.set(category);
}

cancelDelete(): void {
  if (this.deleting()) return;
  this.categoryToDelete.set(null);
}

confirmDelete(): void {
  const category = this.categoryToDelete();
  if (!category || this.deleting()) return;

  this.deleting.set(true);
  this.categoryService
    .deleteCategory(category.id)
    .pipe(finalize(() => this.deleting.set(false)))
    .subscribe({
      next: () => {
        this.categoryToDelete.set(null);
        this.getCategory(); // اسم ميثود الـ reload الموجودة عندك
      },
      error: () => this.deleteError.set('CATEGORY.DELETE_FAILED'), // مفتاح ngx-translate
    });
}
}
