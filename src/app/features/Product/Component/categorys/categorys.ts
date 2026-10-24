import { Component, DestroyRef, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { LanguageService } from '../../../../core/services/language-service';
import { TranslatePipe } from '@ngx-translate/core';
import { ProductService } from '../../Service/product-service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  imports: [TranslatePipe , CommonModule , FormsModule , ReactiveFormsModule],
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

  constructor(private _ProductService: ProductService) {}

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
}
