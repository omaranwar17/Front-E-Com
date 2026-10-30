import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarcodeComponent } from './barcode-component';

describe('BarcodeComponent', () => {
  let component: BarcodeComponent;
  let fixture: ComponentFixture<BarcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
