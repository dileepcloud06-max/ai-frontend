import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReviewService } from '../services/review';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './review.html',
  styleUrls: ['./review.css']
})
export class ReviewComponent implements OnInit {

  reviews: any[] = [];

  positiveCount = 15;
  negativeCount = 14;
  neutralCount = 1;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {

    this.reviewService.getReviews().subscribe({
      next: (response: any) => {
        console.log(response);
        this.reviews = (response.data || []).map((review: any) => ({
          ...review,
          reviewerName: review.reviewer_name || 'Anonymous Customer',
          reviewText: review.review_text || '',
          summary: `Source: ${review.source || 'Unknown'} | Product: ${review.product || 'Unknown'} | Date: ${review.review_date || 'N/A'}`,
          problem: review.problem_summary,
          category: review.issue_type,
          reason: review.cleaned_review,
          solution: review.recommended_solution
        }));
        this.positiveCount = this.reviews.filter(review => review.sentiment === 'Positive').length;
        this.negativeCount = this.reviews.filter(review => review.sentiment === 'Negative').length;
        this.neutralCount = this.reviews.filter(review => review.sentiment === 'Neutral').length;
      },

      error: (error: any) => {
        console.error('API Error:', error);
      }
    });

  }


async sendEmail(review: any): Promise<void> {

  try {

    console.log("FULL REVIEW:", review);

    const emailPayload = {
      // email lekapothe test email
      email: review.email || "dileepottikunta@gmail.com",

      // payload lo problem send chestunnam
      payload: review.problem_summary || review.problem || review.review_text || "",

      // solution
      solution: review.recommended_solution || review.solution || "",
      review_id: review.review_id
    };

    console.log("EMAIL PAYLOAD:", emailPayload);

    const response = await fetch(
      "http://127.0.0.1:8000/send-email",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(emailPayload)
      }
    );

    const data = await response.json();

    console.log("API RESPONSE:", data);

    if (!response.ok) {

      // FastAPI detail array ni proper ga show cheyyadaniki
      const errorMessage = Array.isArray(data.detail)
        ? data.detail.map((x: any) => x.msg).join(", ")
        : data.detail || "Email sending failed";

      throw new Error(errorMessage);
    }

    alert("Email sent successfully!");

  } catch (error: any) {

    console.error("Email Error:", error);

    alert(error.message);
  }
}

}