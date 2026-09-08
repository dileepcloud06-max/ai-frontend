import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Amazon } from './amazon';

describe('Amazon', () => {
  let component: Amazon;
  let fixture: ComponentFixture<Amazon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Amazon],
    }).compileComponents();

    fixture = TestBed.createComponent(Amazon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
