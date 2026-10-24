import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { ProductService } from '../../Service/product-service';
import { LanguageService } from '../../../../core/services/language-service';

interface ICategory {
  id: number;
  name: string;
}

interface IPhotoPreview {
  file: File;
  url: string;
}

const MAX_PHOTOS = 6;
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// السعر القديم اختياري، لكن لو موجود لازم يكون >= السعر الجديد
function oldPriceValidator(group: AbstractControl): ValidationErrors | null {
  const newPrice = Number(group.get('newPrice')?.value);
  const oldPrice = group.get('oldPrice')?.value;
  if (oldPrice === null || oldPrice === '' || Number(oldPrice) === 0) return null;
  return Number(oldPrice) >= newPrice ? null : { oldPriceLower: true };
}

@Component({
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  selector: 'app-add-product',
  styleUrl: './add-product.scss',
  templateUrl: './add-product.html',
})
export class AddProduct implements OnInit{
  
  private productService = inject(ProductService);
  langService = inject(LanguageService);

  categories = signal<ICategory[]>([]);
  photos = signal<IPhotoPreview[]>([]);
  photoError = signal<'type' | 'size' | 'max' | 'required' | null>(null);
  loading = signal(false);
  result = signal<'success' | 'error' | null>(null);
  serverMessage = signal('');

  readonly maxPhotos = MAX_PHOTOS;

  form = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      newPrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
      oldPrice: new FormControl<number | null>(null, [Validators.min(0)]),
      categoryId: new FormControl<number | null>(null, [Validators.required]),
    },
    { validators: oldPriceValidator }
  );

  constructor() {
    // تنضيف الـ object URLs لما الكومبوننت يتقفل
    inject(DestroyRef).onDestroy(() => this.revokeAll());
  }

  ngOnInit(): void {
    this.productService.getCategory().subscribe({
      next: (res: any) => this.categories.set(res),
      error: (err) => console.error('Error fetching categories', err),
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.photoError.set(null);

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        this.photoError.set('type');
        continue;
      }
      if (file.size > MAX_SIZE) {
        this.photoError.set('size');
        continue;
      }
      if (this.photos().length >= MAX_PHOTOS) {
        this.photoError.set('max');
        break;
      }
      this.photos.update((p) => [...p, { file, url: URL.createObjectURL(file) }]);
    }

    input.value = ''; // عشان نقدر نختار نفس الصورة تاني بعد حذفها
  }

  removePhoto(index: number) {
    const target = this.photos()[index];
    if (target) URL.revokeObjectURL(target.url);
    this.photos.update((p) => p.filter((_, i) => i !== index));
    this.photoError.set(null);
  }

  submit() {
    if (this.loading()) return;
    this.result.set(null);
    this.form.markAllAsTouched();

    if (this.photos().length === 0) {
      this.photoError.set('required');
    }
    if (this.form.invalid || this.photos().length === 0) return;

    const v = this.form.getRawValue();
    const fd = new FormData();
    fd.append('Name', v.name.trim());
    fd.append('Description', v.description.trim());
    fd.append('NewPrice', String(v.newPrice));
    fd.append('OldPrice', String(v.oldPrice ?? 0)); // decimal مش nullable في الباك
    fd.append('CategoryId', String(v.categoryId));
    // نفس الاسم لكل صورة، والأولى هي الرئيسية
    this.photos().forEach((p) => fd.append('Photos', p.file, p.file.name));

    this.loading.set(true);
    this.productService
      .addProduct(fd)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.result.set('success');
          this.serverMessage.set('');
          this.form.reset();
          this.revokeAll();
          this.photos.set([]);
          this.photoError.set(null);
        },
        error: (err) => {
          console.error('Add product failed', err);
          this.serverMessage.set(err?.error?.message ?? '');
          this.result.set('error');
        },
      });
  }

  private revokeAll() {
    this.photos().forEach((p) => URL.revokeObjectURL(p.url));
  }
}
