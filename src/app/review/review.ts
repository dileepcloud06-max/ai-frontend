import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../services/review';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule],
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
        this.reviews = response.data;
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
      payload: review.payload || review.problem || "",

      // solution
      solution: review.solution || ""
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