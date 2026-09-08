import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { ReviewService } from '../services/review';

interface ProductReview {
  author: string;
  rating: number;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  issueType: string;
  text: string;
}

interface Product {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  accent: string;
  image: string;
  price: number;
  bestFor: string;
  avgRating: number;
  positivePct: number;
  negativePct: number;
  neutralPct: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalReviews: number;
  highIssuePct: number;
  recommendationScore: number;
  buyRecommendation: string;
  productUrl: string;
  reviews: ProductReview[];
  issues: { name: string; count: number; percentage: number }[];
}

@Component({
  selector: 'app-product-classification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-classification.html',
  styleUrl: './product-classification.css',
})
export class ProductClassification implements OnInit {
  @ViewChild('analysisCard') analysisCard?: ElementRef<HTMLElement>;

  private readonly reviewService = inject(ReviewService);

  products: Product[] = [];
  categories: string[] = ['ALL'];
  selectedCategory = 'ALL';
  globalSummary: any = null;

  loading = true;
  reviewsLoading = false;
  errorMessage = '';

  selectedProduct!: Product;
  showAllReviews = false;

  ngOnInit(): void {
    this.reviewService.getClassificationSummary().subscribe({
      next: (response: any) => {
        if (response?.data) {
          this.globalSummary = response.data;
          if (Array.isArray(response.data.categories)) {
            this.categories = ['ALL', ...response.data.categories];
          }
        }
      },
      error: (err) => console.log('Classification summary note:', err)
    });

    this.reviewService.getProductCatalog().subscribe({
      next: (response: any) => {
        const rows = this.extractArray(response);
        this.products = rows.map((item: any, index: number) => this.mapCatalogProduct(item, index));
        this.selectedProduct = this.products[0];
        this.loading = false;

        if (this.selectedProduct) {
          this.loadProductReviews(this.selectedProduct);
        } else {
          this.errorMessage = 'No products found in catalog.';
        }
      },
      error: (error: any) => {
        this.errorMessage = error?.error?.detail || 'Unable to load the product catalog.';
        this.loading = false;
      }
    });
  }

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'ALL') return this.products;
    return this.products.filter(p => p.category.toLowerCase() === this.selectedCategory.toLowerCase());
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    const available = this.filteredProducts;
    if (available.length) {
      this.selectProduct(available[0]);
    }
  }

  private extractArray(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.reviews)) return response.reviews;
    if (Array.isArray(response?.results)) return response.results;
    if (Array.isArray(response?.items)) return response.items;
    return [];
  }

  private normalizePercent(value: any): number {
    let n = Number(value ?? 0);
    if (!Number.isFinite(n)) return 0;

    // Supports 0.6, 60, and accidental 6000 formats.
    if (n > 100) n = n / 100;
    if (n > 0 && n <= 1) n = n * 100;

    return Math.min(100, Math.max(0, n));
  }

  private mapCatalogProduct(item: any, index: number): Product {
    const positivePct = this.normalizePercent(item.positive_pct ?? item.positivePct);
    const negativePct = this.normalizePercent(item.negative_pct ?? item.negativePct);
    const neutralPct = Math.max(0, 100 - positivePct - negativePct);

    const positiveCount = Number(item.positive_count ?? 0);
    const negativeCount = Number(item.negative_count ?? 0);
    const neutralCount = Number(item.neutral_count ?? 0);
    const totalReviews = Number(item.total_reviews ?? (positiveCount + negativeCount + neutralCount));

    const mappedIssues = Array.isArray(item.issues) ? item.issues.map((iss: any) => ({
      name: String(iss.name || ''),
      count: Number(iss.count || 0),
      percentage: Number(iss.percentage || 0)
    })) : [];

    return {
      product_id: String(item.product_id ?? item.id ?? ''),
      name: item.product_name ?? item.product ?? item.name ?? 'Unnamed product',
      brand: item.brand ?? '',
      category: item.category ?? 'Unclassified',
      accent: ['blue', 'teal', 'amber', 'coral', 'indigo'][index % 5],
      image: item.image_url_1 ?? item.image_url ?? item.image ?? '',
      price: Number(item.price_inr ?? item.price ?? 0),
      bestFor: item.best_for ?? '',
      avgRating: Number(item.avg_rating ?? item.average_rating ?? 0),
      positivePct,
      negativePct,
      neutralPct,
      positiveCount,
      negativeCount,
      neutralCount,
      totalReviews,
      highIssuePct: this.normalizePercent(item.high_issue_pct),
      recommendationScore: Number(item.recommendation_score ?? 0),
      buyRecommendation: item.buy_recommendation ?? 'CONSIDER',
      productUrl: item.product_url ?? '',
      reviews: [],
      issues: mappedIssues
    };
  }

  get positiveReviews(): number {
    return this.selectedProduct?.positivePct ?? 0;
  }

  get negativeReviews(): number {
    return this.selectedProduct?.negativePct ?? 0;
  }

  get neutralReviews(): number {
    return this.selectedProduct?.neutralPct ?? 0;
  }

  get positiveCount(): number {
    if (this.selectedProduct?.reviews.length) {
      return this.selectedProduct.reviews.filter(r => r.sentiment === 'Positive').length;
    }
    return this.selectedProduct?.positiveCount ?? 0;
  }

  get negativeCount(): number {
    if (this.selectedProduct?.reviews.length) {
      return this.selectedProduct.reviews.filter(r => r.sentiment === 'Negative').length;
    }
    return this.selectedProduct?.negativeCount ?? 0;
  }

  get neutralCount(): number {
    if (this.selectedProduct?.reviews.length) {
      return this.selectedProduct.reviews.filter(r => r.sentiment === 'Neutral').length;
    }
    return this.selectedProduct?.neutralCount ?? 0;
  }

  get visibleReviews(): ProductReview[] {
    if (!this.selectedProduct) return [];
    return this.showAllReviews ? this.selectedProduct.reviews : this.selectedProduct.reviews.slice(0, 3);
  }

  get issueTotal(): number {
    return this.selectedProduct?.issues.reduce((total, issue) => total + issue.count, 0) ?? 0;
  }

  averageRating(product: Product): number {
    if (product.reviews.length) {
      const sum = product.reviews.reduce((total, review) => total + review.rating, 0);
      return sum / product.reviews.length;
    }
    return product.avgRating;
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.showAllReviews = false;
    this.loadProductReviews(product);
  }

  selectProductByIndex(index: number): void {
    const product = this.products[index];
    if (product) this.selectProduct(product);
  }

  toggleReviews(): void {
    this.showAllReviews = !this.showAllReviews;
  }

  private loadProductReviews(product: Product): void {
    this.reviewsLoading = true;
    product.reviews = [];
    product.issues = [];

    this.reviewService.getProductReviews(product.name).subscribe({
      next: (response: any) => {
        const rows = this.extractArray(response);

        product.reviews = rows.map((item: any): ProductReview => ({
          author: item.reviewer_name ?? item.reviewerName ?? item.source ?? 'Anonymous customer',
          rating: this.safeRating(item.rating),
          sentiment: this.toSentiment(item.sentiment ?? item.best_model_prediction),
          issueType: this.cleanIssueType(item.issue_type ?? item.issueType),
          text: item.review_text ?? item.review ?? item.problem_summary ?? 'No review text available.'
        }));

        this.recalculateProductMetrics(product);
        product.issues = this.buildIssueCounts(product.reviews);

        this.reviewsLoading = false;
        this.showAllReviews = false;
      },
      error: (error: any) => {
        console.error('Product reviews API error:', error);
        product.reviews = [];
        product.issues = [];
        this.reviewsLoading = false;
      }
    });
  }

  private recalculateProductMetrics(product: Product): void {
    const total = product.reviews.length;
    if (!total) {
      product.positivePct = 0;
      product.negativePct = 0;
      product.neutralPct = 0;
      return;
    }

    const positive = product.reviews.filter(r => r.sentiment === 'Positive').length;
    const negative = product.reviews.filter(r => r.sentiment === 'Negative').length;
    const neutral = product.reviews.filter(r => r.sentiment === 'Neutral').length;

    product.positivePct = (positive / total) * 100;
    product.negativePct = (negative / total) * 100;
    product.neutralPct = (neutral / total) * 100;
  }

  private safeRating(value: any): number {
    const rating = Math.round(Number(value ?? 0));
    return Math.max(0, Math.min(5, rating));
  }

  private cleanIssueType(value: any): string {
    const issue = String(value ?? '').trim();
    if (!issue || issue.toLowerCase() === 'nan' || issue.toLowerCase() === 'null') {
      return 'Unclassified';
    }
    return issue;
  }

  private toSentiment(value: any): ProductReview['sentiment'] {
    const sentiment = String(value ?? '').trim().toLowerCase();
    if (sentiment.startsWith('pos')) return 'Positive';
    if (sentiment.startsWith('neg')) return 'Negative';
    return 'Neutral';
  }

  private buildIssueCounts(reviews: ProductReview[]): { name: string; count: number; percentage: number }[] {
    const counts = new Map<string, number>();

    reviews.forEach(review => {
      const issue = review.issueType.trim();
      const ignored = ['no issue', 'none', 'positive feedback', 'unclassified', 'n/a', 'na'];

      // Main Issues should represent actual problems, not positive/no-issue reviews.
      if (!issue || ignored.includes(issue.toLowerCase())) return;

      counts.set(issue, (counts.get(issue) ?? 0) + 1);
    });

    const totalIssueMentions = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);

    return Array.from(counts, ([name, count]) => ({
      name,
      count,
      percentage: totalIssueMentions ? (count / totalIssueMentions) * 100 : 0
    }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  chartSegment(value: number, total: number): string {
    const amount = total ? (value / total) * 100 : 0;
    return `${amount} ${100 - amount}`;
  }

  chartOffset(values: number[], index: number, total: number): number {
    return -values
      .slice(0, index)
      .reduce((sum, value) => sum + (total ? (value / total) * 100 : 0), 0);
  }

  async downloadAnalysisCard(): Promise<void> {
    if (!this.analysisCard) return;

    const { default: html2canvas } = await import('html2canvas');
    const card = this.analysisCard.nativeElement;
    const originalWidth = card.style.width;
    const originalMaxWidth = card.style.maxWidth;

    try {
      const captureWidth = Math.max(card.scrollWidth, 1080);
      card.style.width = `${captureWidth}px`;
      card.style.maxWidth = `${captureWidth}px`;

      const canvas = await html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: captureWidth,
        height: card.scrollHeight,
        windowWidth: captureWidth,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `${this.selectedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-analysis.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      card.style.width = originalWidth;
      card.style.maxWidth = originalMaxWidth;
    }
  }
}
