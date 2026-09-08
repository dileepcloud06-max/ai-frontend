import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService, NewReviewPayload } from '../services/review';

@Component({
  selector: 'app-write-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './write-review.html',
  styleUrls: ['./write-review.css']
})
export class WriteReviewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reviewService = inject(ReviewService);
  private cdr = inject(ChangeDetectorRef);

  submitting = false;
  successMessage = '';
  errorMessage = '';
  categories = ['Electronics', 'Apparel', 'Home', 'Beauty', 'Software', 'Food'];
  sources = ['Otto', 'Amazon', 'Custom'];
  uploadedBase64Url = '';
  selectedFileName = '';

  form = this.fb.group({
    productName: ['', [Validators.required, Validators.minLength(2)]],
    productCategory: ['', Validators.required],
    source: ['', Validators.required],
    customSource: [''],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    escalation: [false],
    review: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.form.controls.source.valueChanges.subscribe(value => {
      if (value === 'Custom') {
        this.form.controls.customSource.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        this.form.controls.customSource.clearValidators();
        this.form.controls.customSource.setValue('');
      }
      this.form.controls.customSource.updateValueAndValidity();
    });
  }

  setRating(value: number): void {
    this.form.patchValue({ rating: value });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedBase64Url = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.uploadedBase64Url = '';
    this.selectedFileName = '';
    this.cdr.detectChanges();
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const selectedSource = this.form.value.source;
    const customVal = this.form.value.customSource ? this.form.value.customSource.trim() : '';

    const payload: NewReviewPayload = {
      productName: this.form.value.productName!.trim(),
      productCategory: this.form.value.productCategory!,
      source: selectedSource === 'Custom' ? customVal : (selectedSource || ''),
      customSource: selectedSource === 'Custom' ? customVal : undefined,
      rating: Number(this.form.value.rating),
      escalation: this.form.value.escalation ? 'Y' : 'N',
      review: this.form.value.review!.trim(),
      url: this.uploadedBase64Url || undefined,
      dateTime: new Date().toISOString()
    };

    this.reviewService.createReview(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Review submitted successfully.';
        this.uploadedBase64Url = '';
        this.selectedFileName = '';
        this.form.reset({
          productName: '',
          productCategory: '',
          source: '',
          customSource: '',
          rating: 5,
          escalation: false,
          review: ''
        });
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.submitting = false;
        const detail = error?.error?.detail;
        this.errorMessage = Array.isArray(detail)
          ? detail.map((item: any) => item.msg).join(', ')
          : detail || error?.message || 'Unable to submit the review.';
        this.cdr.detectChanges();
      }
    });
  }
}
