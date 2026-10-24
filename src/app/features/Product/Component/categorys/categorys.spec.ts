import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Categorys } from './categorys';

describe('Categorys', () => {
  let component: Categorys;
  let fixture: ComponentFixture<Categorys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Categorys],
    }).compileComponents();

    fixture = TestBed.createComponent(Categorys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
