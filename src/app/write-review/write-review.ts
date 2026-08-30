import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../services/review';

@Component({
  selector: 'app-write-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './write-review.html',
  styleUrls: ['./write-review.css']
})
export class WriteReviewComponent {
  private fb = inject(FormBuilder);
  private reviewService = inject(ReviewService);

  submitting = false;
  successMessage = '';
  errorMessage = '';
  categories = ['Electronics', 'Apparel', 'Home', 'Beauty', 'Software', 'Food'];

  form = this.fb.group({
    productName: ['', [Validators.required, Validators.minLength(2)]],
    productCategory: ['', Validators.required],
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    review: ['', [Validators.required, Validators.minLength(10)]]
  });

  setRating(value: number): void {
    this.form.patchValue({ rating: value });
  }

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload = {
      productName: this.form.value.productName!.trim(),
      productCategory: this.form.value.productCategory!,
      rating: Number(this.form.value.rating),
      review: this.form.value.review!.trim(),
      dateTime: new Date().toISOString()
    };

    this.reviewService.createReview(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Review submitted successfully.';
        this.form.reset({
          productName: '',
          productCategory: '',
          rating: 5,
          review: ''
        });
      },
      error: (error: any) => {
        this.submitting = false;
        const detail = error?.error?.detail;
        this.errorMessage = Array.isArray(detail)
          ? detail.map((item: any) => item.msg).join(', ')
          : detail || error?.message || 'Unable to submit the review.';
      }
    });
  }
}
