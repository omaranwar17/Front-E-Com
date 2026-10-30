import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarcodePrint } from './barcode-print';

describe('BarcodePrint', () => {
  let component: BarcodePrint;
  let fixture: ComponentFixture<BarcodePrint>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodePrint],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodePrint);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
