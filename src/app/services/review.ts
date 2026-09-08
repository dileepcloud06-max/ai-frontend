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

  private apiUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/data';
  private dataUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/data';
  private newReviewUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/newreview';
  private sendEmailUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/send-email';
  private chatbotUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/chatbot';

  private analyticsOverviewUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/analytics-overview';
  private kpiUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/kpicards';
  private issueSummaryUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/gl_issue_summary';
  private modelMetricsUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/gl_model_metrics';
  private productInsightsUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/gl_product_insights';
  private productCatalogUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/product-catalog';
  private productReviewsUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/product-reviews';
  private alertCountUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/alert-count';
  private crmSummaryUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/crm-summary';
  private crmReviewsUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net/crm-reviews';

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

  private classificationSummaryUrl = 'https://bs-bkc6dgh4d7fahjey.westus3-01.azurewebsites.net//classification-summary';

  getClassificationSummary(): Observable<any> {
    return this.http.get<any>(this.classificationSummaryUrl, { params: { _t: Date.now().toString() } });
  }

  closeCrmReview(reviewId: string): Observable<any> {
    return this.http.put<any>(`${this.crmReviewsUrl}/${encodeURIComponent(reviewId)}/close`, {});
  }
}
