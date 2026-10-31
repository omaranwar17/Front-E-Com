import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Location, DOCUMENT, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {  TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, TranslatePipe , CommonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  private readonly location = inject(Location);
  private readonly translate = inject(TranslateService);

  readonly dir$ = this.translate.onLangChange.pipe(
    map(e => (e.lang === 'ar' ? 'rtl' : 'ltr')),
    startWith('rtl')
  );

  goBack(): void {
    this.location.back();
  }
}