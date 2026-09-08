import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import { finalize, timeout } from 'rxjs';
import { ReviewService } from '../services/review';

export interface SentimentItem {
  label: string;
  value: number;
  color: string;
}

export interface ModelItem {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  trainingTime: string | number;
  active: boolean;
}

export interface IssueSummaryItem {
  issue_type: string;
  review_count: number;
  negative_count: number;
  high_priority_count: number;
  percentage: number;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  sentiment: SentimentItem[] = [
    { label: 'Negative', value: 0, color: '#ef5350' },
    { label: 'Neutral', value: 0, color: '#f6aa3c' },
    { label: 'Positive', value: 0, color: '#36c98b' }
  ];

  models: ModelItem[] = [];

  selectedModelName = 'Logistic Regression';
  selectedEmailPeriod: 'Today' | '7 Days' | '30 Days' | 'Custom' = 'Today';

  emailAnalyticsData = {
    today_count: 0,
    days_7_count: 0,
    days_30_count: 0,
    total_sent: 0,
    chart_bars: [] as number[]
  };
  emailEvents: Array<{ review_id: string; timestamp: string }> = [];
  sourceSummary: Array<{ source: string; review_count: number }> = [];
  issueSummary: IssueSummaryItem[] = [];

  readonly keywords = {
    negative: ['poor', 'schlecht', 'problem', 'unzuverlässig', 'hat probleme'],
    neutral: ['okay', 'fine', 'durchschnittlich', 'decent', 'average'],
    positive: ['ausgezeichnet', 'excellent', 'sehr gut', 'reliable', 'überzeugt']
  };

  matrix = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];

  reportDate = 'May 1, 2024 - May 31, 2024';
  downloading = false;
  refreshing = false;
  analyticsError = '';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadAnalyticsData();
    this.loadIssueSummary();
  }

  loadIssueSummary(): void {
    this.reviewService.getIssueSummary().subscribe({
      next: (res: any) => {
        this.issueSummary = res?.status === 'success' && Array.isArray(res.data) ? res.data : [];
      },
      error: (err: any) => console.error('Error loading issue summary API:', err)
    });
  }

  get totalReviews(): number {
    return this.sentiment.reduce((total, item) => total + item.value, 0);
  }

  get maxSentiment(): number {
    return Math.max(...this.sentiment.map(item => item.value), 1);
  }

  get positiveCount(): number {
    const item = this.sentiment.find(s => s.label === 'Positive');
    return item ? item.value : 0;
  }

  get negativeCount(): number {
    const item = this.sentiment.find(s => s.label === 'Negative');
    return item ? item.value : 0;
  }

  get neutralCount(): number {
    const item = this.sentiment.find(s => s.label === 'Neutral');
    return item ? item.value : 0;
  }

  get currentSelectedModel(): ModelItem {
    return this.models.find(m => m.name === this.selectedModelName) || this.models[0];
  }

  get selectedModelMetrics(): Array<{ name: string; value: number; color: string }> {
    const m = this.currentSelectedModel;
    if (!m) return [];

    return [
      { name: 'Accuracy', value: m.accuracy, color: '#3d9bf2' },
      { name: 'Precision', value: m.precision, color: '#8b63d7' },
      { name: 'Recall', value: m.recall, color: '#3bc891' },
      { name: 'F1 Score', value: m.f1, color: '#f4ab3c' }
    ];
  }

  get displayedEmailsSentCount(): number {
    if (this.selectedEmailPeriod === '7 Days') return this.emailAnalyticsData.days_7_count;
    if (this.selectedEmailPeriod === '30 Days') return this.emailAnalyticsData.days_30_count;
    if (this.selectedEmailPeriod === 'Custom') return this.emailAnalyticsData.total_sent;
    return this.emailAnalyticsData.today_count;
  }

  get displayedEmailPeriodLabel(): string {
    if (this.selectedEmailPeriod === '7 Days') return 'Emails sent in last 7 days';
    if (this.selectedEmailPeriod === '30 Days') return 'Emails sent in last 30 days';
    if (this.selectedEmailPeriod === 'Custom') return 'Emails sent total';
    return 'Emails sent today';
  }

  selectEmailPeriod(period: 'Today' | '7 Days' | '30 Days' | 'Custom'): void {
    this.selectedEmailPeriod = period;
  }

  sentimentPercent(value: number): number {
    if (!this.totalReviews) return 0;
    return (value / this.totalReviews) * 100;
  }

  barHeight(value: number): number {
    return Math.max(9, (value / this.maxSentiment) * 100);
  }

  selectModel(modelName: string): void {
    this.selectedModelName = modelName;
    this.models = this.models.map(m => ({
      ...m,
      active: m.name === modelName
    }));
  }

  loadAnalyticsData(): void {
    this.refreshing = true;
    this.analyticsError = '';
    this.reviewService.getAnalyticsOverview().pipe(
      timeout({ each: 35000 }),
      finalize(() => this.refreshing = false)
    ).subscribe({
      next: (res: any) => {
        if (res && res.status === 'success' && res.data) {
          const sData = res.data.sentiment_summary || [];
          if (sData.length > 0) {
            const pos = sData.find((s: any) => s.sentiment === 'Positive')?.review_count ?? 0;
            const neu = sData.find((s: any) => s.sentiment === 'Neutral')?.review_count ?? 0;
            const neg = sData.find((s: any) => s.sentiment === 'Negative')?.review_count ?? 0;
            this.sentiment = [
              { label: 'Negative', value: neg, color: '#ef5350' },
              { label: 'Neutral', value: neu, color: '#f6aa3c' },
              { label: 'Positive', value: pos, color: '#36c98b' }
            ];
          }

          const mData = res.data.model_metrics || [];
          if (mData.length > 0) {
            this.models = mData.map((m: any) => {
              const name = m.model === 'Linear Regression' ? 'Logistic Regression' : m.model;
              return {
                name: name,
                accuracy: m.accuracy,
                precision: m.precision,
                recall: m.recall,
                f1: m.f1,
                trainingTime: m.training_time ?? 'N/A',
                active: name === this.selectedModelName
              };
            });
          }

          if (res.data.email_analytics) {
            this.emailAnalyticsData = res.data.email_analytics;
          }
          this.emailEvents = res.data.email_events || [];
          this.sourceSummary = res.data.source_summary || [];
          this.matrix = res.data.confusion_matrix || this.matrix;
        }
      },
      error: (err: any) => {
        console.error('Error loading analytics overview API:', err);
        this.analyticsError = 'Analytics data could not be loaded. Check that the backend API is running.';
      }
    });
  }

  async downloadReport(): Promise<void> {
    this.downloading = true;
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const { jsPDF } = await import('jspdf');
      const report = document.querySelector<HTMLElement>('.analytics-report');
      if (!report) return;

      const canvas = await html2canvas(report, { scale: 2, backgroundColor: '#f4f8ff', useCORS: true });
      const image = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let remaining = imageHeight;
      let position = 0;

      pdf.addImage(image, 'JPEG', 0, position, pageWidth, imageHeight);
      remaining -= pageHeight;
      while (remaining > 0) {
        position = remaining - imageHeight;
        pdf.addPage();
        pdf.addImage(image, 'JPEG', 0, position, pageWidth, imageHeight);
        remaining -= pageHeight;
      }
      pdf.save('feedback-analytics-report.pdf');
    } catch (e) {
      console.error('Download report error:', e);
    } finally {
      this.downloading = false;
    }
  }

  refreshData(): void {
    this.loadAnalyticsData();
  }
}

