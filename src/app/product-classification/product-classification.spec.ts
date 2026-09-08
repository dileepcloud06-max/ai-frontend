import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductClassification } from './product-classification';

describe('ProductClassification', () => {
  let component: ProductClassification;
  let fixture: ComponentFixture<ProductClassification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductClassification],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductClassification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
