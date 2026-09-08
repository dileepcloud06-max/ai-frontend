import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface NewReviewPayload {
  productName: string;
  productCategory: string;
  rating: number;
  review: string;
  dateTime: string;
  source?: string;
  customSource?: string;
  url?: string;
  priority?: string;
  escalation?: boolean | 'Y' | 'N';
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl = 'http://127.0.0.1:8000/data';
  private dataUrl = 'http://127.0.0.1:8000/data';
  private newReviewUrl = 'http://127.0.0.1:8000/newreview';
  private sendEmailUrl = 'http://127.0.0.1:8000/send-email';
  private chatbotUrl = 'http://127.0.0.1:8000/chatbot';

  private analyticsOverviewUrl = 'http://127.0.0.1:8000/analytics-overview';
  private kpiUrl = 'http://127.0.0.1:8000/kpicards';
  private issueSummaryUrl = 'http://127.0.0.1:8000/gl_issue_summary';
  private modelMetricsUrl = 'http://127.0.0.1:8000/gl_model_metrics';
  private productInsightsUrl = 'http://127.0.0.1:8000/gl_product_insights';
  private productCatalogUrl = 'http://127.0.0.1:8000/product-catalog';
  private productReviewsUrl = 'http://127.0.0.1:8000/product-reviews';
  private alertCountUrl = 'http://127.0.0.1:8000/alert-count';
  private crmSummaryUrl = 'http://127.0.0.1:8000/crm-summary';
  private crmReviewsUrl = 'http://127.0.0.1:8000/crm-reviews';

  private chatbotOpenSubject = new Subject<boolean>();
  chatbotOpen$ = this.chatbotOpenSubject.asObservable();

  openChatbot(): void {
    this.chatbotOpenSubject.next(true);
  }

  getAnalyticsOverview(): Observable<any> {
    return this.http.get<any>(this.analyticsOverviewUrl, { params: { _t: Date.now().toString() } });
  }

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

  sendEmail(payload: { email: string; payload: string; solution: string; review_id: string }): Observable<any> {
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

  getProductCatalog(): Observable<any> {
    return this.http.get<any>(this.productCatalogUrl, { params: { _t: Date.now().toString() } });
  }

  getProductReviews(product: string): Observable<any> {
    return this.http.get<any>(this.productReviewsUrl, {
      params: { product, _t: Date.now().toString() }
    });
  }

  getAlertCount(): Observable<any> {
    return this.http.get<any>(this.alertCountUrl, {
      params: { _t: Date.now().toString() }
    });
  }

  getCrmSummary(): Observable<any> {
    return this.http.get<any>(this.crmSummaryUrl, { params: { _t: Date.now().toString() } });
  }

  getCrmReviews(): Observable<any> {
    return this.http.get<any>(this.crmReviewsUrl, { params: { _t: Date.now().toString() } });
  }

  private classificationSummaryUrl = 'http://127.0.0.1:8000/classification-summary';

  getClassificationSummary(): Observable<any> {
    return this.http.get<any>(this.classificationSummaryUrl, { params: { _t: Date.now().toString() } });
  }

  closeCrmReview(reviewId: string): Observable<any> {
    return this.http.put<any>(`${this.crmReviewsUrl}/${encodeURIComponent(reviewId)}/close`, {});
  }
}
