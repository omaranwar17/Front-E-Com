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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { ProductService } from '../../Service/product-service';
import { LanguageService } from '../../../../core/services/language-service';
import { ToastrService } from 'ngx-toastr';

interface ICategory {
  id: number;
  name: string;
  hasSizes: boolean;
}

interface IPhotoPreview {
  file: File;
  url: string;
}

const MAX_PHOTOS = 6;
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  productId: number | null = null;

  get isEdit(): boolean {
    return this.productId !== null;
  }

  categories = signal<ICategory[]>([]);
  sizes = signal<{ id: number; name: string }[]>([]); 
  showSizeField = signal<boolean>(false); 

  photos = signal<IPhotoPreview[]>([]);
  existingPhotos = signal<string[]>([]);
  photoError = signal<'type' | 'size' | 'max' | 'required' | null>(null);
  loading = signal(false);
  result = signal<'success' | 'error' | null>(null);
  serverMessage = signal('');

  readonly maxPhotos = MAX_PHOTOS;
  readonly imageBase = 'https://localhost:7020';

  form = new FormGroup(
    {
      name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      newPrice: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
      oldPrice: new FormControl<number | null>(null, [Validators.min(0)]),
      categoryId: new FormControl<number | null>(null, [Validators.required]),
      sizes: new FormControl<number[]>([], { nonNullable: true }), // ✅ بقت Array
    },
    { validators: oldPriceValidator }
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokeAll());
  }

  ngOnInit(): void {
    this.productService.getCategory().subscribe({
      next: (res: any) => this.categories.set(res),
      error: (err) => console.error('Error fetching categories', err),
    });

    this.productService.getSizes().subscribe({
      next: (res) => this.sizes.set(res),
      error: (err) => console.error('Error fetching sizes', err),
    });

    this.form.get('categoryId')?.valueChanges.subscribe((catId) => {
      const selectedCat = this.categories().find((c) => c.id === catId);
      const hasSizes = selectedCat?.hasSizes ?? false;
      this.showSizeField.set(hasSizes);

      if (!hasSizes) {
        this.form.patchValue({ sizes: [] }); // ✅ مسح المقاسات كـ Array
      }
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
        // ✅ تحويل النص اللي جاي من الباك ("S,M,L") لأرقام (IDs) بتاعة الشيك بوكس
        let selectedSizes: number[] = [];
        if (p.sizes) {
          selectedSizes = p.sizes.split(',')
            .map((s: string) => this.sizes().find(x => x.name === s.trim())?.id)
            .filter((x: any) => x !== undefined);
        }

        this.form.patchValue({
          name: p.name,
          description: p.description,
          newPrice: p.newPrice,
          oldPrice: p.oldPrice,
          categoryId: p.categoryId,
          sizes: selectedSizes // ✅ بنبعت الـ Array
        });
        this.existingPhotos.set((p.photos ?? []).map((ph: any) => ph.imageName));
        
        const selectedCat = this.categories().find((c) => c.id === p.categoryId);
        this.showSizeField.set(selectedCat?.hasSizes ?? false);
      },
      error: (err) => {
        console.error('Load product failed', err);
        this._router.navigate(['/products']);
      },
    });
  }

  // ✅ دالة جديدة عشان نضيف ونشيل المقاسات من الـ Array
  onSizeToggle(event: Event, sizeId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    const currentSizes = this.form.get('sizes')?.value || [];
    
    if (isChecked) {
      this.form.patchValue({ sizes: [...currentSizes, sizeId] });
    } else {
      this.form.patchValue({ sizes: currentSizes.filter(id => id !== sizeId) });
    }
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

    input.value = '';
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
    this.serverMessage.set('');
    this.form.markAllAsTouched();

    if (!this.isEdit && this.photos().length === 0) {
      this.photoError.set('required');
      const warnTitle = this.translate.instant('COMMON.WARNING');
      const warnMsg = this.translate.instant('Product.PHOTO_REQUIRED_WARNING');
      this.toastr.warning(warnMsg, warnTitle);
    } else {
      this.photoError.set(null);
    }

    if (this.form.invalid) {
      const errTitle = this.translate.instant('COMMON.INCOMPLETE_DATA');
      const errMsg = this.translate.instant('COMMON.CHECK_REQUIRED_FIELDS');
      this.toastr.error(errMsg, errTitle);
      return;
    }

    if (!this.isEdit && this.photos().length === 0) {
      return;
    }

    const v = this.form.getRawValue();
    const fd = new FormData();

    if (this.isEdit) fd.append('Id', String(this.productId));
    fd.append('Name', v.name.trim());
    fd.append('Description', v.description.trim());
    fd.append('NewPrice', String(v.newPrice));
    fd.append('OldPrice', String(v.oldPrice ?? 0));
    fd.append('CategoryId', String(v.categoryId));

    // ✅ إرسال المقاسات كـ Array للباك إند
    if (this.showSizeField() && v.sizes && v.sizes.length > 0) {
      v.sizes.forEach((sizeId: number) => {
        fd.append('Sizes', String(sizeId)); 
      });
    }

    this.photos().forEach((p) => fd.append('Photos', p.file, p.file.name));

    const request$ = this.isEdit
      ? this.productService.updateProduct(this.productId!, fd)
      : this.productService.addProduct(fd);

    this.loading.set(true);

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.revokeAll();
        this.photos.set([]);
        this.photoError.set(null);

        const successTitle = this.translate.instant('COMMON.SUCCESS');
        const successMsgKey = this.isEdit ? 'Product.UPDATE_SUCCESS' : 'Product.ADD_SUCCESS';
        const successMsg = this.translate.instant(successMsgKey);
        this.toastr.success(successMsg, successTitle);

        this._router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Save product failed', err);
        const errorMsgKey = err?.error?.message || 'COMMON.SOMETHING_WRONG';
        this.serverMessage.set(err?.error?.message ?? '');
        this.result.set('error');
        const errTitle = this.translate.instant('Product.SAVE_FAILED');
        const errMsg = this.translate.instant(errorMsgKey);
        this.toastr.error(errMsg, errTitle);
      },
    });
  }

  private revokeAll() {
    this.photos().forEach((p) => URL.revokeObjectURL(p.url));
  }
}