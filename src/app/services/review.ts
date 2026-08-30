import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewReviewPayload {
  productName: string;
  productCategory: string;
  rating: number;
  review: string;
  dateTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl = 'http://127.0.0.1:8000/reviews';
  private dataUrl = 'http://127.0.0.1:8000/data';
  private newReviewUrl = 'http://127.0.0.1:8000/newreview';
  private sendEmailUrl = 'http://127.0.0.1:8000/send-email';
  private chatbotUrl = 'http://127.0.0.1:8000/chatbot';

  private kpiUrl = 'http://127.0.0.1:8000/kpicards';
  private issueSummaryUrl = 'http://127.0.0.1:8000/gl_issue_summary';
  private modelMetricsUrl = 'http://127.0.0.1:8000/gl_model_metrics';
  private productInsightsUrl = 'http://127.0.0.1:8000/gl_product_insights';

  constructor(private http: HttpClient) {}

  getReviews(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getData(payload?: any): Observable<any> {
    const params = { ...payload, _t: Date.now().toString() };
    return this.http.get<any>(this.dataUrl, { params });
  }

  sendChatbot(payload: { text?: string; image?: string }): Observable<any> {
    return this.http.post<any>(this.chatbotUrl, payload);
  }

  createReview(payload: NewReviewPayload): Observable<any> {
    return this.http.post<any>(this.newReviewUrl, payload);
  }

  sendEmail(payload: { email: string; payload: string; solution: string }): Observable<any> {
    return this.http.post<any>(this.sendEmailUrl, payload);
  }

  getKpiCards(): Observable<any> {
    return this.http.get<any>(this.kpiUrl);
  }

  getIssueSummary(): Observable<any> {
    return this.http.get<any>(this.issueSummaryUrl);
  }

  getModelMetrics(): Observable<any> {
    return this.http.get<any>(this.modelMetricsUrl);
  }

  getProductInsights(): Observable<any> {
    return this.http.get<any>(this.productInsightsUrl);
  }
}
