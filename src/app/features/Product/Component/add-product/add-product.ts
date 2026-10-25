import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
export class AddProduct implements OnInit {
  private productService = inject(ProductService);
  langService = inject(LanguageService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  productId: number | null = null;

  get isEdit(): boolean {
    return this.productId !== null;
  }

  categories = signal<ICategory[]>([]);
  photos = signal<IPhotoPreview[]>([]);
  existingPhotos = signal<string[]>([]); // صور المنتج الحالية (في التعديل)
  photoError = signal<'type' | 'size' | 'max' | 'required' | null>(null);
  loading = signal(false);
  result = signal<'success' | 'error' | null>(null);
  serverMessage = signal('');

  readonly maxPhotos = MAX_PHOTOS;
  readonly imageBase = 'https://localhost:7020'; // ⚠️ غيّره لنفس القيمة اللي في ProductList

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

    const id = this._route.snapshot.paramMap.get('id');
    if (id && !Number.isNaN(Number(id))) {
      this.productId = Number(id);
      this.loadProduct(this.productId);
    }
  }


photoUrl(name: string): string {
  const base = this.imageBase.replace(/\/+$/, '');
  const path = name.replace(/^\/+/, '');
  return `${base}/${path}`;
}

  private loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (p: any) => {
        this.form.patchValue({
          name: p.name,
          description: p.description,
          newPrice: p.newPrice,
          oldPrice: p.oldPrice,
          categoryId: p.categoryId,
        });
        this.existingPhotos.set((p.photos ?? []).map((ph: any) => ph.imageName));
      },
      error: (err) => {
        console.error('Load product failed', err);
        this._router.navigate(['/products']);
      },
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

    // الصور مطلوبة في الإضافة بس. في التعديل اختيارية (لو مفيش جديدة بتفضل القديمة)
    if (!this.isEdit && this.photos().length === 0) {
      this.photoError.set('required');
    }
    if (this.form.invalid || (!this.isEdit && this.photos().length === 0)) return;

    const v = this.form.getRawValue();
    const fd = new FormData();
    if (this.isEdit) fd.append('Id', String(this.productId));
    fd.append('Name', v.name.trim());
    fd.append('Description', v.description.trim());
    fd.append('NewPrice', String(v.newPrice));
    fd.append('OldPrice', String(v.oldPrice ?? 0)); // decimal مش nullable في الباك
    fd.append('CategoryId', String(v.categoryId));
    // نفس الاسم لكل صورة، والأولى هي الرئيسية
    this.photos().forEach((p) => fd.append('Photos', p.file, p.file.name));

    const request$ = this.isEdit
      ? this.productService.updateProduct(this.productId!, fd)
      : this.productService.addProduct(fd);

    this.loading.set(true);
    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.result.set('success');
        this.serverMessage.set('');
        this.revokeAll();
        this.photos.set([]);
        this.photoError.set(null);

        if (this.isEdit) {
          // نعيد تحميل المنتج عشان نعرض الصور الجديدة
          this.loadProduct(this.productId!);
        } else {
          this.form.reset();
        }
      },
      error: (err) => {
        console.error('Save product failed', err);
        this.serverMessage.set(err?.error?.message ?? '');
        this.result.set('error');
      },
    });
  }

  private revokeAll() {
    this.photos().forEach((p) => URL.revokeObjectURL(p.url));
  }
}