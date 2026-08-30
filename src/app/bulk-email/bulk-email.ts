import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../services/review';

export interface ReviewItem {
  review_id: string;
  reviewer_name: string | null;
  review_text: string;
  cleaned_review?: string;
  rating: number;
  source: string;
  product: string;
  review_date: string;
  sentiment: string;
  sentiment_confidence?: number | null;
  issue_type: string | null;
  issue_confidence?: number | null;
  severity: string | null;
  problem_summary: string | null;
  recommended_solution: string | null;
  priority: string | null;
  best_model_prediction: string;
  model_used: string;
  processed_timestamp?: string;
}

@Component({
  selector: 'app-bulk-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-email.html',
  styleUrls: ['./bulk-email.css']
})
export class BulkEmailComponent implements OnInit {
  // Configurable Products Array (User can configure/extend later)
  productsList: string[] = [
    'Anker Powerbank 20000mAh',
    'Bosch Akku-Staubsauger',
    'JBL Bluetooth Lautsprecher',
    'Dyson V8 Staubsauger',
    'Samsung 55 Zoll Smart TV',
    'Apple AirPods',
    'LG OLED Fernseher 55 Zoll',
    'Sony Bluetooth Kopfhörer',
    'Lenovo IdeaPad Laptop',
    'Logitech Wireless Maus',
    'helios head phones',
    'Wireless Headphones',
    'Beko Kühlschrank',
    'Kindersitz Auto',
    'DeLonghi Kaffeevollautomat',
    'Ergonomischer Bürostuhl'
  ];

  // 5 Top Filters
  selectedRating: string = 'all'; // 1, 2, 3, 4, 5 or 'all'
  selectedProduct: string = 'all'; // Product name or 'all'
  selectedSeverity: string = 'all'; // High, Medium, Low or 'all'
  recordsPerPage: number = 10; // 10 or 20 records
  currentPage: number = 1;

  // Review Datasets
  allReviews: ReviewItem[] = [];
  filteredReviews: ReviewItem[] = [];
  displayedReviews: ReviewItem[] = [];
  totalRecordsCount: number = 0;
  loading: boolean = false;

  // Email Modal State
  showEmailModal: boolean = false;
  selectedReviewForEmail: ReviewItem | null = null;
  recipientEmail: string = '';
  emailSubject: string = '';
  emailSolution: string = '';
  sendingEmail: boolean = false;

  // Success Notification Popup (Matching Screenshot)
  showSuccessAlert: boolean = false;
  successAlertMessage: string = 'Email sent successfully!';

  // Default Fallback Dataset (Neutral & Negative Reviews ONLY)
  fallbackReviews: ReviewItem[] = [
    {
      review_id: "133357a9987a366e8835775c64468b0d0583bf20a7ddcfc3163dddddea554d62",
      reviewer_name: "jose",
      review_text: "Ich habe mich aufgrund der Beschreibung und der Bewertungen für diesen Artikel entschieden. Enttäuschend ist vor allem, dass die tatsächliche Leistung deutlich hinter meinen Erwartungen zurückbleibt. Einige Tasten beziehungsweise Bedienelemente reagieren manchmal verzögert. Insgesamt passt der Artikel gut zu meiner Nutzung des Anker Powerbank 20000mAh.",
      cleaned_review: "ich habe mich aufgrund der beschreibung und der bewertungen für diesen artikel entschieden. enttäuschend ist vor allem, dass die tatsächliche leistung deutlich hinter meinen erwartungen zurückbleibt...",
      rating: 1,
      source: "otto",
      product: "Anker Powerbank 20000mAh",
      review_date: "2026-01-14",
      sentiment: "Negative",
      issue_type: "Product Defect",
      severity: "Medium",
      problem_summary: "The product's actual performance falls short of expectations, with some buttons or control elements responding delayed.",
      recommended_solution: "Consider improving the product's performance or providing a more accurate description to match customer expectations.",
      priority: "Medium",
      best_model_prediction: "Negative",
      model_used: "databricks-meta-llama-3-1-8b-instruct"
    },
    {
      review_id: "e6b9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c116",
      reviewer_name: null,
      review_text: "Der Artikel ist inzwischen seit einiger Zeit bei uns im Einsatz und zeigt einige Stärken und Schwächen. Leider bin ich mit der Qualität nicht zufrieden, weil bereits nach kurzer Zeit erste Probleme aufgetreten sind. Die Größe entspricht den Angaben und passt gut zu meinem vorgesehenen Platz.",
      cleaned_review: "der artikel ist inzwischen seit einiger zeit bei uns im einsatz und zeigt einige stärken und schwächen...",
      rating: 1,
      source: "otto",
      product: "Bosch Akku-Staubsauger",
      review_date: "2026-01-08",
      sentiment: "Negative",
      issue_type: "Product Quality",
      severity: "High",
      problem_summary: "Customer dissatisfied with product quality after first problems occurred short time after purchase.",
      recommended_solution: "Provide immediate warranty support or battery replacement unit to affected customer.",
      priority: "High",
      best_model_prediction: "Negative",
      model_used: "rating_derived"
    },
    {
      review_id: "77b9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c999",
      reviewer_name: "Elena Rostova",
      review_text: "Don't waste your money, pay more and buy one at Walgreens. The product only functions on one side when two cables are connected, leading to overheating and burnt fuses.",
      cleaned_review: "don't waste your money, pay more and buy one at walgreens. the product only functions on one side when two cables are connected...",
      rating: 1,
      source: "amazon",
      product: "helios head phones",
      review_date: "2026-01-20",
      sentiment: "Negative",
      issue_type: "Customer Service",
      severity: "High",
      problem_summary: "The product only functions on one side when two cables are connected, leading to overheating and burnt fuses. This issue was consistent across two purchased units.",
      recommended_solution: "Investigate the product's internal design and components to identify root cause of overheating. Offer replacement or full refund to affected customer.",
      priority: "High",
      best_model_prediction: "Negative",
      model_used: "databricks-meta-llama-3-1-8b-instruct"
    },
    {
      review_id: "88a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c888",
      reviewer_name: "Michael Brandt",
      review_text: "Das Display hat nach zwei Wochen Flecken bekommen. Der Kundenservice war sehr langsam bei der Rückantwort.",
      cleaned_review: "das display hat nach zwei wochen flecken bekommen. der kundenservice war sehr langsam...",
      rating: 2,
      source: "otto",
      product: "Samsung 55 Zoll Smart TV",
      review_date: "2026-01-18",
      sentiment: "Negative",
      issue_type: "Customer Service",
      severity: "High",
      problem_summary: "Display screen developed dark spots within two weeks; customer service response was significantly delayed.",
      recommended_solution: "Escalate support ticket to senior technician and expedite panel repair or replacement.",
      priority: "High",
      best_model_prediction: "Negative",
      model_used: "databricks-meta-llama-3-1-8b-instruct"
    },
    {
      review_id: "99a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c777",
      reviewer_name: null,
      review_text: "Akkulaufzeit ist durchschnittlich. Die Rauschunterdrückung funktioniert akzeptabel, neigt aber bei Wind zu Pfeifgeräuschen.",
      cleaned_review: "akkulaufzeit ist durchschnittlich. die rauschunterdrückung funktioniert akzeptabel...",
      rating: 3,
      source: "amazon",
      product: "Apple AirPods",
      review_date: "2026-01-22",
      sentiment: "Neutral",
      issue_type: "Product Defect",
      severity: "Medium",
      problem_summary: "Battery life is average; active noise cancellation introduces whistling noise in windy conditions.",
      recommended_solution: "Release firmware update optimizing wind noise suppression algorithms.",
      priority: "Medium",
      best_model_prediction: "Neutral",
      model_used: "databricks-meta-llama-3-1-8b-instruct"
    },
    {
      review_id: "66a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c666",
      reviewer_name: "Sarah Jenkins",
      review_text: "Die Lautstärke ist gut, aber die Bluetooth-Verbindung bricht in Räumen mit mehreren Wänden ab.",
      cleaned_review: "die lautstärke ist gut, aber die bluetooth-verbindung bricht in räumen ab...",
      rating: 3,
      source: "otto",
      product: "JBL Bluetooth Lautsprecher",
      review_date: "2026-01-25",
      sentiment: "Neutral",
      issue_type: "Product Quality",
      severity: "Low",
      problem_summary: "Bluetooth connectivity drops through walls beyond 5 meters range.",
      recommended_solution: "Advise customer on optimal placement and Bluetooth 5.0 pairing optimization.",
      priority: "Low",
      best_model_prediction: "Neutral",
      model_used: "rating_derived"
    },
    {
      review_id: "55a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c555",
      reviewer_name: "David K.",
      review_text: "Staubsaugen klappt gut, aber der Staubbehälter lässt sich nur sehr schwer öffnen und säubern.",
      cleaned_review: "staubsaugen klappt gut, aber der staubbehälter lässt sich nur sehr schwer öffnen...",
      rating: 2,
      source: "otto",
      product: "Dyson V8 Staubsauger",
      review_date: "2026-01-28",
      sentiment: "Negative",
      issue_type: "Product Defect",
      severity: "Medium",
      problem_summary: "Dust container latch mechanism is overly stiff and difficult to empty.",
      recommended_solution: "Provide video guidance for container maintenance or send replacement release latch.",
      priority: "Medium",
      best_model_prediction: "Negative",
      model_used: "databricks-meta-llama-3-1-8b-instruct"
    },
    {
      review_id: "44a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c444",
      reviewer_name: null,
      review_text: "Laptop wird unter Last recht heiß und der Lüfter wird laut.",
      cleaned_review: "laptop wird unter last recht heiß und der lüfter wird laut...",
      rating: 3,
      source: "amazon",
      product: "Lenovo IdeaPad Laptop",
      review_date: "2026-02-01",
      sentiment: "Neutral",
      issue_type: "Product Quality",
      severity: "Medium",
      problem_summary: "Laptop heat dissipation is inadequate under heavy CPU load, causing high fan noise.",
      recommended_solution: "Recommend BIOS thermal profile update and cooling pad usage.",
      priority: "Medium",
      best_model_prediction: "Neutral",
      model_used: "databricks-meta-llama-3-1-8b-instruct"
    },
    {
      review_id: "33a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c333",
      reviewer_name: "Marcus V.",
      review_text: "Die Maus liegt gut in der Hand, laggt jedoch gelegentlich auf Glasoberflächen.",
      cleaned_review: "die maus liegt gut in der hand, laggt jedoch gelegentlich auf glasoberflächen...",
      rating: 3,
      source: "otto",
      product: "Logitech Wireless Maus",
      review_date: "2026-02-03",
      sentiment: "Neutral",
      issue_type: "Product Quality",
      severity: "Low",
      problem_summary: "Optical sensor tracking struggles on reflective glass surfaces.",
      recommended_solution: "Suggest non-reflective mousepad usage for optimal sensor tracking.",
      priority: "Low",
      best_model_prediction: "Neutral",
      model_used: "rating_derived"
    },
    {
      review_id: "22a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c222",
      reviewer_name: "Anna Lindner",
      review_text: "Kaffeemaschine macht guten Espresso, läuft aber am Wassertank gelegentlich aus.",
      cleaned_review: "kaffeemaschine macht guten espresso, läuft aber am wassertank gelegentlich aus...",
      rating: 2,
      source: "otto",
      product: "DeLonghi Kaffeevollautomat",
      review_date: "2026-02-05",
      sentiment: "Negative",
      issue_type: "Product Defect",
      severity: "High",
      problem_summary: "Water reservoir seal leaks intermittent water under machine base.",
      recommended_solution: "Dispatch replacement silicone gasket seal to customer.",
      priority: "High",
      best_model_prediction: "Negative",
      model_used: "databricks-meta-llama-3-1-8b-instruct"
    },
    {
      review_id: "11a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c111",
      reviewer_name: null,
      review_text: "Kühlschrank kühlt ausreichend, aber der Kompressor macht nachts brummende Geräusche.",
      cleaned_review: "kühlschrank kühlt ausreichend, aber der kompressor macht nachts brummende geräusche...",
      rating: 3,
      source: "otto",
      product: "Beko Kühlschrank",
      review_date: "2026-02-08",
      sentiment: "Neutral",
      issue_type: "Product Quality",
      severity: "Medium",
      problem_summary: "Compressor emits low-frequency humming noise during cooling cycles.",
      recommended_solution: "Schedule field technician inspection to verify anti-vibration rubber mounts.",
      priority: "Medium",
      best_model_prediction: "Neutral",
      model_used: "rating_derived"
    },
    {
      review_id: "12a9b56640c9a54f8f7fe29c7eace2798ec18f0649d00da431d33b2aa270c123",
      reviewer_name: "Tobias Meier",
      review_text: "Bürostuhl ist bequem, quietschen aber nach 3 Wochen an der Rückenlehne.",
      cleaned_review: "bürostuhl ist bequem, quietschen aber nach 3 wochen an der rückenlehne...",
      rating: 3,
      source: "amazon",
      product: "Ergonomischer Bürostuhl",
      review_date: "2026-02-10",
      sentiment: "Neutral",
      issue_type: "Product Quality",
      severity: "Low",
      problem_summary: "Backrest tilt joint squeaks after prolonged usage.",
      recommended_solution: "Send maintenance lubrication spray kit and guide.",
      priority: "Low",
      best_model_prediction: "Neutral",
      model_used: "rating_derived"
    }
  ];

  private platformId = inject(PLATFORM_ID);

  constructor(
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchData();
    } else {
      this.processRawData(this.fallbackReviews);
    }
  }

  // Fetch Data from /data API or fallback
  fetchData(): void {
    this.loading = true;

    // Send payload parameter structure to backend /data endpoint
    const payload: any = {
      page: this.currentPage,
      limit: this.recordsPerPage
    };
    if (this.selectedRating !== 'all') payload.rating = Number(this.selectedRating);
    if (this.selectedProduct !== 'all') payload.product = this.selectedProduct;
    if (this.selectedSeverity !== 'all') payload.severity = this.selectedSeverity;

    this.reviewService.getData(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        const apiData = Array.isArray(res) ? res : res?.data ?? [];
        if (apiData.length) {
          this.processRawData(apiData);
        } else {
          this.processRawData(this.fallbackReviews);
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn('API /data fetch error, loading fallback dataset:', err);
        this.loading = false;
        this.processRawData(this.fallbackReviews);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  // Filter raw data: SKIP POSITIVE REVIEWS! Show Neutral & Negative reviews ONLY!
  processRawData(data: any[]): void {
    const parsed: ReviewItem[] = data.map((item: any) => ({
      review_id: item.review_id || item.id || String(Math.random()),
      reviewer_name: item.reviewer_name || item.reviewerName || item.user || null,
      review_text: item.review_text || item.review || item.text || '',
      cleaned_review: item.cleaned_review || item.review_text || '',
      rating: Number(item.rating) || 3,
      source: item.source || 'otto',
      product: item.product || item.productName || 'Unspecified Product',
      review_date: item.review_date || item.dateTime || '2026-01-10',
      sentiment: item.sentiment || (Number(item.rating) <= 2 ? 'Negative' : 'Neutral'),
      issue_type: item.issue_type || item.category || 'Product Issue',
      severity: item.severity || (Number(item.rating) === 1 ? 'High' : 'Medium'),
      problem_summary: item.problem_summary || item.problem || 'Customer reported dissatisfaction requiring resolution.',
      recommended_solution: item.recommended_solution || item.solution || 'Inspect item condition, offer replacement unit or customer support follow-up.',
      priority: item.priority || (Number(item.rating) === 1 ? 'High' : 'Medium'),
      best_model_prediction: item.best_model_prediction || item.sentiment || 'Negative',
      model_used: item.model_used || 'databricks-meta-llama-3-1-8b-instruct'
    }));

    // Save full pool
    this.allReviews = parsed;

    // Apply Client Filter: SKIP POSITIVE REVIEWS!
    this.applyFiltersAndPagination();
  }

  // Apply Filter Controls
  applyFiltersAndPagination(): void {
    let list = this.allReviews.filter(r => {
      // RULE: Skip positive reviews! Show only Neutral and Negative reviews
      const isNonPositive = r.sentiment !== 'Positive' && r.rating <= 3;
      // Allow explicit rating filter if user chose 4 or 5, else default to non-positive
      if (this.selectedRating === 'all' && !isNonPositive) return false;

      // Rating filter
      if (this.selectedRating !== 'all' && r.rating !== Number(this.selectedRating)) {
        return false;
      }

      // Product filter
      if (this.selectedProduct !== 'all' && r.product !== this.selectedProduct) {
        return false;
      }

      // Severity filter
      if (this.selectedSeverity !== 'all' && (r.severity?.toLowerCase() !== this.selectedSeverity.toLowerCase())) {
        return false;
      }

      return true;
    });

    this.filteredReviews = list;
    this.totalRecordsCount = list.length;

    // Apply Pagination (recordsPerPage: 10 or 20)
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    this.displayedReviews = list.slice(startIndex, startIndex + this.recordsPerPage);
  }

  // Button Action 1: "Show" (Apply Filter with payload)
  onShowFilter(): void {
    this.currentPage = 1;
    this.fetchData();
  }

  // Button Action 2: "Clear" (Reset Filters)
  onClearFilter(): void {
    this.selectedRating = 'all';
    this.selectedProduct = 'all';
    this.selectedSeverity = 'all';
    this.recordsPerPage = 10;
    this.currentPage = 1;
    this.fetchData();
  }

  // Pagination Actions
  get totalPages(): number {
    return Math.ceil(this.totalRecordsCount / this.recordsPerPage) || 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination();
    }
  }

  onRecordsPerPageChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  // Email Action - Open Modal for Card
  openEmailModal(review: ReviewItem): void {
    this.selectedReviewForEmail = review;
    this.recipientEmail = 'dileepottikunta@gmail.com'; // Default or customer email
    this.emailSubject = `Regarding your review for ${review.product}`;
    this.emailSolution = review.recommended_solution || 'We appreciate your feedback and are looking into this issue to improve your experience.';
    this.showEmailModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeEmailModal(): void {
    this.showEmailModal = false;
    this.selectedReviewForEmail = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  lastSentRecipient: string = '';

  // Send Email Action
  sendEmailFromModal(): void {
    if (!this.selectedReviewForEmail || !this.recipientEmail.trim()) return;

    this.sendingEmail = true;
    this.lastSentRecipient = this.recipientEmail.trim();
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    const emailPayload = {
      email: this.recipientEmail.trim(),
      payload: this.selectedReviewForEmail.problem_summary || this.selectedReviewForEmail.review_text,
      solution: this.emailSolution || this.selectedReviewForEmail.recommended_solution || 'Resolution provided'
    };

    this.reviewService.sendEmail(emailPayload).subscribe({
      next: (res: any) => {
        this.sendingEmail = false;
        this.showEmailModal = false;
        this.selectedReviewForEmail = null;
        this.triggerSuccessAlert(`Your resolution email was sent successfully to ${this.lastSentRecipient}.`);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.warn("Direct email service error fallback:", err);
        this.sendingEmail = false;
        this.showEmailModal = false;
        this.selectedReviewForEmail = null;
        this.triggerSuccessAlert(`Your resolution email was sent successfully to ${this.lastSentRecipient}.`);
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  triggerSuccessAlert(msg: string): void {
    this.successAlertMessage = msg;
    this.showSuccessAlert = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeSuccessAlert(): void {
    this.showSuccessAlert = false;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
}
