import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ReviewService } from '../services/review';

export interface KpiItem {
  sentiment: string;
  review_count: number;
  percentage: number;
}

export interface IssueItem {
  issue_type: string | null;
  review_count: number;
  negative_count: number;
  high_priority_count: number;
  percentage: number;
}

export interface ModelMetricItem {
  model_name: string;
  model_category: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  training_time: number | null;
  inference_time: number | null;
  notes: string | null;
}

export interface ProductInsightItem {
  product: string;
  total_reviews: number;
  positive_reviews: number;
  negative_reviews: number;
  neutral_reviews: number;
  high_priority_issues: number;
  negative_percentage: number;
  top_issue: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  period = 'Last 6 Months';
  periods = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 6 Months'];

  // Overall KPI Card Summary
  totalReviews = 10002;
  positives = 4522;
  positivesPct = 45.21;
  neutrals = 4693;
  neutralsPct = 46.92;
  negatives = 787;
  negativesPct = 7.87;

  // Monthly trend series
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  currentSeries = [18, 28, 22, 36, 30, 42, 38, 48];
  previousSeries = [12, 20, 26, 24, 32, 28, 34, 30];

  // Tooltip tracking
  hoveredVisitorIndex: number | null = null;
  visitorTooltipX = 0;
  visitorTooltipY = 0;

  // Product Insights Data (72 products total)
  productFilter = 'top10';
  productSearch = '';
  productInsights: ProductInsightItem[] = [
    { product: "Apple AirPods", total_reviews: 134, positive_reviews: 73, negative_reviews: 39, neutral_reviews: 22, high_priority_issues: 0, negative_percentage: 29.1, top_issue: null },
    { product: "JBL Bluetooth Lautsprecher", total_reviews: 151, positive_reviews: 74, negative_reviews: 44, neutral_reviews: 33, high_priority_issues: 0, negative_percentage: 29.14, top_issue: null },
    { product: "LG OLED Fernseher 55 Zoll", total_reviews: 126, positive_reviews: 68, negative_reviews: 35, neutral_reviews: 23, high_priority_issues: 0, negative_percentage: 27.78, top_issue: null },
    { product: "Dyson V8 Staubsauger", total_reviews: 146, positive_reviews: 78, negative_reviews: 39, neutral_reviews: 29, high_priority_issues: 0, negative_percentage: 26.71, top_issue: null },
    { product: "Samsung 55 Zoll Smart TV", total_reviews: 133, positive_reviews: 67, negative_reviews: 35, neutral_reviews: 31, high_priority_issues: 0, negative_percentage: 26.32, top_issue: null },
    { product: "Sony Bluetooth Kopfhörer", total_reviews: 145, positive_reviews: 82, negative_reviews: 34, neutral_reviews: 29, high_priority_issues: 0, negative_percentage: 23.45, top_issue: null },
    { product: "Bosch Akku-Staubsauger", total_reviews: 144, positive_reviews: 77, negative_reviews: 33, neutral_reviews: 34, high_priority_issues: 0, negative_percentage: 22.92, top_issue: null },
    { product: "Lenovo IdeaPad Laptop", total_reviews: 147, positive_reviews: 63, negative_reviews: 18, neutral_reviews: 66, high_priority_issues: 7, negative_percentage: 12.24, top_issue: "Product Quality" },
    { product: "Anker Powerbank 20000mAh", total_reviews: 134, positive_reviews: 61, negative_reviews: 13, neutral_reviews: 60, high_priority_issues: 3, negative_percentage: 9.7, top_issue: "Product Quality" },
    { product: "Sneaker Damen", total_reviews: 120, positive_reviews: 49, negative_reviews: 11, neutral_reviews: 60, high_priority_issues: 4, negative_percentage: 9.17, top_issue: "Product Quality" },
    { product: "Logitech Wireless Maus", total_reviews: 153, positive_reviews: 65, negative_reviews: 14, neutral_reviews: 74, high_priority_issues: 5, negative_percentage: 9.15, top_issue: "Product Quality" },
    { product: "Gartenliege", total_reviews: 125, positive_reviews: 60, negative_reviews: 11, neutral_reviews: 54, high_priority_issues: 3, negative_percentage: 8.8, top_issue: "Product Quality" },
    { product: "Winterjacke Herren", total_reviews: 106, positive_reviews: 39, negative_reviews: 9, neutral_reviews: 58, high_priority_issues: 2, negative_percentage: 8.49, top_issue: "Product Quality" },
    { product: "Matratze 90x200", total_reviews: 154, positive_reviews: 64, negative_reviews: 13, neutral_reviews: 77, high_priority_issues: 8, negative_percentage: 8.44, top_issue: "Product Quality" },
    { product: "Yogamatte", total_reviews: 144, positive_reviews: 62, negative_reviews: 12, neutral_reviews: 70, high_priority_issues: 4, negative_percentage: 8.33, top_issue: "Product Quality" },
    { product: "Ergonomischer Bürostuhl", total_reviews: 124, positive_reviews: 61, negative_reviews: 10, neutral_reviews: 53, high_priority_issues: 3, negative_percentage: 8.06, top_issue: "Product Quality" },
    { product: "Familienspiel Brettspiel", total_reviews: 149, positive_reviews: 62, negative_reviews: 12, neutral_reviews: 75, high_priority_issues: 4, negative_percentage: 8.05, top_issue: "Product Quality" },
    { product: "Standventilator", total_reviews: 157, positive_reviews: 59, negative_reviews: 12, neutral_reviews: 86, high_priority_issues: 2, negative_percentage: 7.64, top_issue: "Product Quality" },
    { product: "Boxspringbett 180x200", total_reviews: 158, positive_reviews: 72, negative_reviews: 12, neutral_reviews: 74, high_priority_issues: 3, negative_percentage: 7.59, top_issue: "Product Quality" },
    { product: "Elektrische Zahnbürste", total_reviews: 147, positive_reviews: 62, negative_reviews: 11, neutral_reviews: 74, high_priority_issues: 3, negative_percentage: 7.48, top_issue: "Product Quality" },
    { product: "E-Bike City", total_reviews: 134, positive_reviews: 64, negative_reviews: 10, neutral_reviews: 60, high_priority_issues: 1, negative_percentage: 7.46, top_issue: "Product Quality" },
    { product: "Siemens Geschirrspüler", total_reviews: 136, positive_reviews: 63, negative_reviews: 10, neutral_reviews: 63, high_priority_issues: 2, negative_percentage: 7.35, top_issue: "Product Quality" },
    { product: "Beko Kühlschrank", total_reviews: 130, positive_reviews: 56, negative_reviews: 9, neutral_reviews: 65, high_priority_issues: 1, negative_percentage: 6.92, top_issue: "Product Quality" },
    { product: "Laufschuhe Herren", total_reviews: 130, positive_reviews: 58, negative_reviews: 9, neutral_reviews: 63, high_priority_issues: 4, negative_percentage: 6.92, top_issue: "Product Quality" },
    { product: "Siemens Mikrowelle", total_reviews: 147, positive_reviews: 55, negative_reviews: 10, neutral_reviews: 82, high_priority_issues: 6, negative_percentage: 6.8, top_issue: "Product Quality" },
    { product: "Kindersitz Auto", total_reviews: 138, positive_reviews: 63, negative_reviews: 9, neutral_reviews: 66, high_priority_issues: 2, negative_percentage: 6.52, top_issue: "Product Quality" },
    { product: "Philips Kaffeemaschine", total_reviews: 140, positive_reviews: 61, negative_reviews: 9, neutral_reviews: 70, high_priority_issues: 2, negative_percentage: 6.43, top_issue: "Product Quality" },
    { product: "Schreibtisch Eiche", total_reviews: 125, positive_reviews: 62, negative_reviews: 8, neutral_reviews: 55, high_priority_issues: 5, negative_percentage: 6.4, top_issue: "Product Quality" },
    { product: "Balkonmöbel Set", total_reviews: 142, positive_reviews: 60, negative_reviews: 9, neutral_reviews: 73, high_priority_issues: 1, negative_percentage: 6.34, top_issue: "Product Quality" },
    { product: "Baustellenfahrzeug Spielzeug", total_reviews: 159, positive_reviews: 61, negative_reviews: 10, neutral_reviews: 88, high_priority_issues: 4, negative_percentage: 6.29, top_issue: "Product Quality" },
    { product: "Haartrockner", total_reviews: 143, positive_reviews: 57, negative_reviews: 9, neutral_reviews: 77, high_priority_issues: 3, negative_percentage: 6.29, top_issue: "Product Quality" },
    { product: "Teppich Wohnzimmer", total_reviews: 162, positive_reviews: 61, negative_reviews: 10, neutral_reviews: 91, high_priority_issues: 4, negative_percentage: 6.17, top_issue: "Product Quality" },
    { product: "Schlafsofa 3-Sitzer", total_reviews: 147, positive_reviews: 73, negative_reviews: 9, neutral_reviews: 65, high_priority_issues: 5, negative_percentage: 6.12, top_issue: "Product Quality" },
    { product: "Laufschuhe Damen", total_reviews: 134, positive_reviews: 53, negative_reviews: 8, neutral_reviews: 73, high_priority_issues: 1, negative_percentage: 5.97, top_issue: "Product Quality" },
    { product: "Rowenta Bügeleisen", total_reviews: 136, positive_reviews: 63, negative_reviews: 8, neutral_reviews: 65, high_priority_issues: 1, negative_percentage: 5.88, top_issue: "Product Quality" },
    { product: "Puppenhaus", total_reviews: 171, positive_reviews: 76, negative_reviews: 10, neutral_reviews: 85, high_priority_issues: 3, negative_percentage: 5.85, top_issue: "Product Quality" },
    { product: "Gartenwerkzeug Set", total_reviews: 156, positive_reviews: 66, negative_reviews: 9, neutral_reviews: 81, high_priority_issues: 1, negative_percentage: 5.77, top_issue: "Product Quality" },
    { product: "HP Multifunktionsdrucker", total_reviews: 145, positive_reviews: 75, negative_reviews: 8, neutral_reviews: 62, high_priority_issues: 1, negative_percentage: 5.52, top_issue: "Product Quality" },
    { product: "Tefal Heißluftfritteuse", total_reviews: 127, positive_reviews: 43, negative_reviews: 7, neutral_reviews: 77, high_priority_issues: 2, negative_percentage: 5.51, top_issue: "Product Quality" },
    { product: "Leifheit Wäscheständer", total_reviews: 164, positive_reviews: 79, negative_reviews: 9, neutral_reviews: 76, high_priority_issues: 1, negative_percentage: 5.49, top_issue: "Product Quality" },
    { product: "Fahrradhelm", total_reviews: 169, positive_reviews: 86, negative_reviews: 9, neutral_reviews: 74, high_priority_issues: 0, negative_percentage: 5.33, top_issue: "Product Quality" },
    { product: "Winterjacke Damen", total_reviews: 133, positive_reviews: 58, negative_reviews: 7, neutral_reviews: 68, high_priority_issues: 3, negative_percentage: 5.26, top_issue: "Product Quality" },
    { product: "Couchtisch Holz", total_reviews: 153, positive_reviews: 68, negative_reviews: 8, neutral_reviews: 77, high_priority_issues: 4, negative_percentage: 5.23, top_issue: "Product Quality" },
    { product: "Stehlampe LED", total_reviews: 136, positive_reviews: 60, negative_reviews: 7, neutral_reviews: 69, high_priority_issues: 5, negative_percentage: 5.15, top_issue: "Product Quality" },
    { product: "Logitech Tastatur", total_reviews: 160, positive_reviews: 76, negative_reviews: 8, neutral_reviews: 76, high_priority_issues: 5, negative_percentage: 5.0, top_issue: "Product Quality" },
    { product: "Jeans Damen", total_reviews: 141, positive_reviews: 65, negative_reviews: 7, neutral_reviews: 69, high_priority_issues: 2, negative_percentage: 4.96, top_issue: "Product Quality" },
    { product: "Hantelset", total_reviews: 166, positive_reviews: 68, negative_reviews: 8, neutral_reviews: 90, high_priority_issues: 1, negative_percentage: 4.82, top_issue: "Product Quality" },
    { product: "Baumwoll-Bettwäsche", total_reviews: 147, positive_reviews: 71, negative_reviews: 7, neutral_reviews: 69, high_priority_issues: 2, negative_percentage: 4.76, top_issue: "Product Quality" },
    { product: "Reisekoffer", total_reviews: 148, positive_reviews: 66, negative_reviews: 7, neutral_reviews: 75, high_priority_issues: 3, negative_percentage: 4.73, top_issue: "Product Quality" },
    { product: "Jeans Herren", total_reviews: 130, positive_reviews: 58, negative_reviews: 6, neutral_reviews: 66, high_priority_issues: 4, negative_percentage: 4.62, top_issue: "Product Quality" },
    { product: "Xiaomi Redmi Smartphone", total_reviews: 155, positive_reviews: 67, negative_reviews: 7, neutral_reviews: 81, high_priority_issues: 3, negative_percentage: 4.52, top_issue: "Product Quality" },
    { product: "DeLonghi Kaffeevollautomat", total_reviews: 156, positive_reviews: 72, negative_reviews: 7, neutral_reviews: 77, high_priority_issues: 2, negative_percentage: 4.49, top_issue: "Product Quality" },
    { product: "Kommode mit Schubladen", total_reviews: 135, positive_reviews: 62, negative_reviews: 6, neutral_reviews: 67, high_priority_issues: 1, negative_percentage: 4.44, top_issue: "Product Quality" },
    { product: "Bosch Küchenmaschine", total_reviews: 158, positive_reviews: 66, negative_reviews: 7, neutral_reviews: 85, high_priority_issues: 8, negative_percentage: 4.43, top_issue: "Product Quality" },
    { product: "Philips Standmixer", total_reviews: 162, positive_reviews: 82, negative_reviews: 7, neutral_reviews: 73, high_priority_issues: 3, negative_percentage: 4.32, top_issue: "Product Quality" },
    { product: "Laptop Rucksack", total_reviews: 140, positive_reviews: 68, negative_reviews: 6, neutral_reviews: 66, high_priority_issues: 3, negative_percentage: 4.29, top_issue: "Product Quality" },
    { product: "Wandspiegel", total_reviews: 140, positive_reviews: 68, negative_reviews: 6, neutral_reviews: 66, high_priority_issues: 3, negative_percentage: 4.29, top_issue: "Product Quality" },
    { product: "Bosch Wasserkocher", total_reviews: 140, positive_reviews: 60, negative_reviews: 6, neutral_reviews: 74, high_priority_issues: 4, negative_percentage: 4.29, top_issue: "Product Quality" },
    { product: "Saugroboter", total_reviews: 141, positive_reviews: 57, negative_reviews: 6, neutral_reviews: 78, high_priority_issues: 3, negative_percentage: 4.26, top_issue: "Product Quality" },
    { product: "LED Deckenleuchte", total_reviews: 141, positive_reviews: 60, negative_reviews: 6, neutral_reviews: 75, high_priority_issues: 5, negative_percentage: 4.26, top_issue: "Product Quality" },
    { product: "Citybike Damen", total_reviews: 142, positive_reviews: 58, negative_reviews: 6, neutral_reviews: 78, high_priority_issues: 1, negative_percentage: 4.23, top_issue: "Product Quality" },
    { product: "Babyphone", total_reviews: 143, positive_reviews: 72, negative_reviews: 6, neutral_reviews: 65, high_priority_issues: 3, negative_percentage: 4.2, top_issue: "Product Quality" },
    { product: "Bosch Waschmaschine", total_reviews: 157, positive_reviews: 78, negative_reviews: 6, neutral_reviews: 73, high_priority_issues: 2, negative_percentage: 3.82, top_issue: "Product Quality" },
    { product: "Kontaktgrill", total_reviews: 132, positive_reviews: 68, negative_reviews: 5, neutral_reviews: 59, high_priority_issues: 5, negative_percentage: 3.79, top_issue: "Product Quality" },
    { product: "Gardinen Set", total_reviews: 135, positive_reviews: 61, negative_reviews: 5, neutral_reviews: 69, high_priority_issues: 1, negative_percentage: 3.7, top_issue: "Product Quality" },
    { product: "Samsung Galaxy Smartphone", total_reviews: 142, positive_reviews: 61, negative_reviews: 5, neutral_reviews: 76, high_priority_issues: 2, negative_percentage: 3.52, top_issue: "Product Quality" },
    { product: "4-Jahreszeiten-Bettdecke", total_reviews: 114, positive_reviews: 50, negative_reviews: 4, neutral_reviews: 60, high_priority_issues: 3, negative_percentage: 3.51, top_issue: "Product Quality" },
    { product: "Kinderwagen", total_reviews: 143, positive_reviews: 59, negative_reviews: 5, neutral_reviews: 79, high_priority_issues: 7, negative_percentage: 3.5, top_issue: "Product Quality" },
    { product: "Elektrogrill", total_reviews: 123, positive_reviews: 54, negative_reviews: 4, neutral_reviews: 65, high_priority_issues: 2, negative_percentage: 3.25, top_issue: "Product Quality" },
    { product: "Sneaker Herren", total_reviews: 155, positive_reviews: 76, negative_reviews: 4, neutral_reviews: 75, high_priority_issues: 2, negative_percentage: 2.58, top_issue: "Product Quality" },
    { product: "Wireless Headphones", total_reviews: 1, positive_reviews: 0, negative_reviews: 1, neutral_reviews: 0, high_priority_issues: 0, negative_percentage: 100.0, top_issue: null },
    { product: "helios head phones", total_reviews: 1, positive_reviews: 0, negative_reviews: 1, neutral_reviews: 0, high_priority_issues: 0, negative_percentage: 100.0, top_issue: "Customer Service" }
  ];

  hoveredProduct: ProductInsightItem | null = null;
  productTooltipPos = { x: 0, y: 0 };

  // Model Performance Comparison Data (#gl_model_metrics)
  modelMetrics: ModelMetricItem[] = [
    {
      model_name: "Logistic Regression",
      model_category: "Traditional ML",
      accuracy: 1.0,
      precision: 1.0,
      recall: 1.0,
      f1_score: 1.0,
      training_time: 0.74098,
      inference_time: 0.18994,
      notes: null
    },
    {
      model_name: "Linear SVM",
      model_category: "Traditional ML",
      accuracy: 1.0,
      precision: 1.0,
      recall: 1.0,
      f1_score: 1.0,
      training_time: 0.87380,
      inference_time: 0.13327,
      notes: null
    },
    {
      model_name: "Random Forest",
      model_category: "Traditional ML",
      accuracy: 1.0,
      precision: 1.0,
      recall: 1.0,
      f1_score: 1.0,
      training_time: 7.12230,
      inference_time: 0.32538,
      notes: null
    },
    {
      model_name: "CNN",
      model_category: "Deep Learning",
      accuracy: null,
      precision: null,
      recall: null,
      f1_score: null,
      training_time: null,
      inference_time: null,
      notes: "TensorFlow unavailable: No module named 'tensorflow'"
    },
    {
      model_name: "LSTM",
      model_category: "Deep Learning",
      accuracy: null,
      precision: null,
      recall: null,
      f1_score: null,
      training_time: null,
      inference_time: null,
      notes: "TensorFlow unavailable: No module named 'tensorflow'"
    },
    {
      model_name: "BERT Tiny",
      model_category: "Transformer",
      accuracy: null,
      precision: null,
      recall: null,
      f1_score: null,
      training_time: null,
      inference_time: null,
      notes: "torch=No module named 'torch'; transformers=No module named 'transformers'"
    }
  ];

  hoveredModel: ModelMetricItem | null = null;
  modelTooltipPos = { x: 0, y: 0 };

  // Issue Summary Data (#gl_issue_summary)
  issueSummary: IssueItem[] = [
    {
      issue_type: "Product Defect",
      review_count: 1828,
      negative_count: 409,
      high_priority_count: 154,
      percentage: 18.28
    },
    {
      issue_type: "Unclassified",
      review_count: 1000,
      negative_count: 267,
      high_priority_count: 0,
      percentage: 10.0
    },
    {
      issue_type: "Product Quality",
      review_count: 5132,
      negative_count: 108,
      high_priority_count: 39,
      percentage: 51.31
    },
    {
      issue_type: "Other",
      review_count: 78,
      negative_count: 2,
      high_priority_count: 0,
      percentage: 0.78
    },
    {
      issue_type: "Praise",
      review_count: 1963,
      negative_count: 0,
      high_priority_count: 0,
      percentage: 19.63
    },
    {
      issue_type: "Customer Service",
      review_count: 1,
      negative_count: 1,
      high_priority_count: 0,
      percentage: 0.01
    }
  ];

  hoveredIssue: IssueItem | null = null;
  issueTooltipPos = { x: 0, y: 0 };

  constructor(private reviewService: ReviewService, public router: Router) {}

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  openChatbot(): void {
    this.reviewService.openChatbot();
  }

  scrollToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  setPeriod(value: string): void {
    this.period = value;
  }

  // Filtered Products Getter
  get filteredProducts(): ProductInsightItem[] {
    let list = [...this.productInsights];

    if (this.productSearch.trim()) {
      const q = this.productSearch.toLowerCase().trim();
      return list.filter(p => p.product.toLowerCase().includes(q));
    }

    if (this.productFilter.startsWith('single:')) {
      const pName = this.productFilter.replace('single:', '');
      return list.filter(p => p.product === pName);
    }

    if (this.productFilter === 'top10') {
      return list.slice(0, 10);
    }

    if (this.productFilter === 'top20') {
      return list.slice(0, 20);
    }

    return list;
  }

  get maxProductTotal(): number {
    const list = this.filteredProducts;
    if (!list.length) return 180;
    const max = Math.max(...list.map(p => p.total_reviews));
    return Math.max(max, 180);
  }

  // Calculate Product bar segments (percentages of max)
  getProductBarWidth(count: number): number {
    const max = this.maxProductTotal;
    return (count / max) * 100;
  }

  // Product hover tooltip positioning
  onProductHover(event: MouseEvent, item: ProductInsightItem): void {
    this.hoveredProduct = item;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.productTooltipPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - 10
    };
  }

  onProductLeave(): void {
    this.hoveredProduct = null;
  }

  // Model metrics hover tooltip
  onModelHover(event: MouseEvent, item: ModelMetricItem): void {
    this.hoveredModel = item;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.modelTooltipPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - 10
    };
  }

  onModelLeave(): void {
    this.hoveredModel = null;
  }

  // Issue summary hover tooltip
  onIssueHover(event: MouseEvent, item: IssueItem): void {
    this.hoveredIssue = item;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.issueTooltipPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - 10
    };
  }

  onIssueLeave(): void {
    this.hoveredIssue = null;
  }

  // SVG Line/Area Generators
  linePoints(values: number[]): string {
    const width = 640;
    const height = 220;
    const padX = 16;
    const padY = 18;
    const max = 56;
    return values
      .map((value, index) => {
        const x = padX + (index * (width - padX * 2)) / (values.length - 1);
        const y = height - padY - (value / max) * (height - padY * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }

  areaPoints(values: number[]): string {
    const width = 640;
    const height = 220;
    const padX = 16;
    const line = this.linePoints(values);
    return `${padX},${height} ${line} ${width - padX},${height}`;
  }

  getMaxIssueCount(): number {
    if (!this.issueSummary.length) return 450;
    const max = Math.max(...this.issueSummary.map(i => Math.max(i.negative_count, i.high_priority_count)));
    return Math.max(max, 450);
  }

  getIssueBarWidth(count: number): number {
    const max = this.getMaxIssueCount();
    return (count / max) * 100;
  }
}
