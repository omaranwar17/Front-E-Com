import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IProduct } from '../../../../shared/Interfases/IProduct';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../../core/services/language-service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  imports: [CommonModule , TranslatePipe],
  selector: 'app-product-list',
  styleUrl: './product-list.scss',
  templateUrl: './product-list.html',
})
export class ProductList {
 @Input() products: IProduct[] = [];
  langService = inject(LanguageService);
}
