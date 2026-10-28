import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../Service/category-service';
import { LanguageService } from '../../../../core/services/language-service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  imports: [TranslatePipe, CommonModule, ReactiveFormsModule],
  selector: 'app-add-category',
  styleUrl: './add-category.scss',
  templateUrl: './add-category.html',
})
export class AddCategory implements OnInit {
  form: FormGroup;
  
  private toastr = inject(ToastrService);

  // حالات بتتغير بعد رد الـ API: signals عشان الـ view تتحدّث لوحدها
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  formLocked = signal(false); // true أثناء تحميل بيانات الـ edit أو لو التحميل فشل

  // بتتحدد مرة واحدة في ngOnInit قبل أول render
  isEdit = false;
  categoryId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
       hasSizes: [false] // <--- ضيف دي (القيمة الافتراضية false)
    });
  }
  langService = inject(LanguageService);
    private translate = inject(TranslateService);

  get name() { return this.form.get('name')!; }
  get description() { return this.form.get('description')!; }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) return; // add mode

    this.isEdit = true;
    this.form.disable();
    this.formLocked.set(true);

    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('Admin.CATEGORY_NOT_FOUND');
      return;
    }
    this.categoryId = id;

    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        if (!category || category.id !== id || typeof category.name !== 'string') {
          this.errorMessage.set('Admin.SOMETHING_WRONG');
          console.error('Unexpected category response:', category);
          return;
        }
        this.form.patchValue({
          name: category.name,
          description: category.description ?? '',
           hasSizes: category.hasSizes ?? false 
        });
        this.form.enable();
        this.formLocked.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.status === 404 ? 'Admin.CATEGORY_NOT_FOUND' : 'Admin.SOMETHING_WRONG'
        );
        console.error(err);
      },
    });
  }

  // onSubmit(): void {
  //   if (this.form.invalid || this.formLocked() || this.loading()) return;

  //   this.loading.set(true);
  //   this.errorMessage.set('');
  //   this.successMessage.set('');

  //   const { name, description } = this.form.getRawValue();
  //   const dto = {
  //     name: (name as string).trim(),
  //     description: ((description as string | null) ?? '').trim(), // الباك مش بيقبل null
  //   };

  //   const request$ = this.isEdit
  //     ? this.categoryService.updateCategory({ id: this.categoryId!, ...dto })
  //     : this.categoryService.addCategory(dto);

  //   request$.subscribe({
  //     next: (res) => {
  //       this.loading.set(false);
  //       if (res?.statusCode === 200 || res?.statusCode === 201) {
  //         this.successMessage.set(this.isEdit ? 'Admin.CATEGORY_UPDATED' : 'Admin.CATEGORY_ADDED');
  //         if (!this.isEdit) this.form.reset({ name: '', description: '' });
  //       } else {
  //         this.errorMessage.set(res?.message || 'Admin.SOMETHING_WRONG');
  //       }
  //     },
  //     error: (err) => {
  //       this.loading.set(false);
  //       this.errorMessage.set(err?.error?.message || 'Admin.SOMETHING_WRONG');
  //       console.error(err);
  //     },
  //   });
  // }

  onSubmit(): void {
    if (this.form.invalid || this.formLocked() || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { name, description , hasSizes } = this.form.getRawValue();
    const dto = {
      name: (name as string).trim(),
      description: ((description as string | null) ?? '').trim(), 
       hasSizes: !!hasSizes
    };

    const request$ = this.isEdit
      ? this.categoryService.updateCategory({ id: this.categoryId!, ...dto })
      : this.categoryService.addCategory(dto);

    request$.subscribe({
      next: (res) => {
        this.loading.set(false);
        
        // التحقق من نجاح العملية
        if (res?.statusCode === 200 || res?.statusCode === 201) {
          
          // 1. تحديد مفتاح رسالة النجاح بناءً على الإضافة أو التعديل
          const successKey = this.isEdit ? 'CATEGORY.UPDATE_SUCCESS' : 'CATEGORY.ADD_SUCCESS';
          
          // ترجمة النصوص
          const successTitle = this.translate.instant('COMMON.SUCCESS');
          const successMsg = this.translate.instant(successKey);

          // عرض Toastr
          this.toastr.success(successMsg, successTitle);

          // 2. التوجيه لصفحة المنتجات (أو الفئات حسب المسار اللي عندك)
          this.router.navigate(['/products']); 

        } else {
          // في حالة وجود خطأ في الـ Response لكن حالة الشبكة سليمة (200)
          const errorMsgKey = res?.message || 'COMMON.SOMETHING_WRONG';
          
          this.errorMessage.set(errorMsgKey);
          
          const errorTitle = this.translate.instant('COMMON.ERROR');
          const errorMsg = this.translate.instant(errorMsgKey);
          
          this.toastr.error(errorMsg, errorTitle);
        }
      },
      error: (err) => {
        this.loading.set(false);
        
        // لو الـ Backend رجع رسالة خطأ، بنستخدمها. لو لأ، بنستخدم مفتاح افتراضي
        const errorMsgKey = err?.error?.message || 'COMMON.SOMETHING_WRONG';
        
        this.errorMessage.set(errorMsgKey);
        
        const errorTitle = this.translate.instant('COMMON.ERROR');
        const errorMsg = this.translate.instant(errorMsgKey);
        
        this.toastr.error(errorMsg, errorTitle);
        
        console.error(err);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }
}