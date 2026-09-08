import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ReviewService } from '../services/review';

interface Ticket {
  id: string;
  product: string;
  category: string;
  review: number;
  reviewText: string;
  email: string;
}

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm.html',
  styleUrl: './crm.css',
})
export class Crm implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly reviewService = inject(ReviewService);

  searchTerm = '';
  currentPage = 1;
  pageSize = 5;
  loading = false;
  apiError = '';
  tickets: Ticket[] = [];
  summary = { total_count: 0, investigation_count: 0, escalation_count: 0, closed_count: 0 };

  ngOnInit(): void {
    this.loadCrmData();
  }

  loadCrmData(): void {
    this.loading = true;
    this.apiError = '';
    this.reviewService.getCrmSummary().subscribe({
      next: response => this.summary = {
        total_count: Number(response?.data?.total_count ?? 0),
        investigation_count: Number(response?.data?.investigation_count ?? 0),
        escalation_count: Number(response?.data?.escalation_count ?? 0),
        closed_count: Number(response?.data?.closed_count ?? 0)
      },
      error: error => {
        this.apiError = this.getApiError(error);
      }
    });
    this.reviewService.getCrmReviews().subscribe({
      next: response => {
        this.tickets = (response?.data ?? []).map((item: any): Ticket => ({
          id: String(item.review_id),
          product: item.product || 'Unknown product',
          category: item.issue_type || 'Unclassified',
          review: Number(item.rating ?? 0),
          reviewText: item.review_text || 'No review text',
          email: item.reviewer_name || item.source || 'N/A'
        }));
        this.currentPage = 1;
        this.loading = false;
      },
      error: error => {
        this.tickets = [];
        this.loading = false;
        this.apiError = this.getApiError(error);
      }
    });
  }

  private getApiError(error: any): string {
    return error?.error?.detail || 'CRM API unavailable. Start the FastAPI backend and try again.';
  }

  get filteredTickets(): Ticket[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.tickets.filter(ticket => !query || Object.values(ticket).some(value => String(value).toLowerCase().includes(query)));
  }

  get visibleTickets(): Ticket[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTickets.slice(start, start + this.pageSize);
  }

  get pageCount(): number { return Math.max(1, Math.ceil(this.filteredTickets.length / this.pageSize)); }

  updateSearch(value: string): void { this.searchTerm = value; this.currentPage = 1; }
  setPage(page: number): void { this.currentPage = page; }

  closeTicket(ticket: Ticket): void {
    this.reviewService.closeCrmReview(ticket.id).subscribe({
      next: () => this.loadCrmData()
    });
  }

  signOut(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
