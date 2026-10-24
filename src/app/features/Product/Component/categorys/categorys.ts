import { Component, DestroyRef, EventEmitter, inject, OnInit, Output } from '@angular/core';
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
    searchTerm: string = '';
     // بدل ما كانت string، بقت FormControl
  searchControl = new FormControl(''); 
    @Output() searchChanged = new EventEmitter<string>(); // بنبعت البحث للأب

@Output() categorySelected = new EventEmitter<string>();

 
   private destroyRef = inject(DestroyRef);
  constructor(private _ProductService:ProductService ){}
    categories: any[] = [];
     langService = inject(LanguageService);
     ngOnInit(): void {
       this.getCategory()
  // اللوجيك بتاع البحث بدون switchMap
    this.searchControl.valueChanges.pipe(
      debounceTime(400), // استنى 400 مللي ثانية
      distinctUntilChanged(), // لو نفس الكلمة متبعتش تاني
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((searchTerm) => {
      this.searchChanged.emit(searchTerm || ''); 
    });

     }
     getCategory()
     {
      this._ProductService.getCategory().subscribe({
        next:((res:any)=>{
            this.categories = res
        })
      })
     }



  onSearch() {
    this.searchChanged.emit(this.searchTerm);
  }

  onSortChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.sortChanged.emit(selectElement.value);
  }

onCategorySelect(categoryName: string) {
  this.categorySelected.emit(categoryName);
}
}
