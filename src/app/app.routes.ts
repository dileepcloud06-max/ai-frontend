import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './dashboard/dashboard';
import { WriteReviewComponent } from './write-review/write-review';
import { BulkEmailComponent } from './bulk-email/bulk-email';
import { HelpComponent } from './help/help';
import { ProductClassification } from './product-classification/product-classification';
import { Crm } from './crm/crm';
import { Login } from './login/login';
import { Amazon } from './amazon/amazon';
import { authGuard, guestGuard, roleGuard } from './auth.guard';
import { Analytics } from './analytics/analytics';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent, canActivate: [roleGuard('dashboard')] },
      { path: 'analytics', component: Analytics, canActivate: [roleGuard('dashboard')] },
      { path: 'product-classification', component: ProductClassification, canActivate: [roleGuard('dashboard')] },
      { path: 'write-review', component: WriteReviewComponent, canActivate: [roleGuard('dashboard')] },
      { path: 'bulk-email', component: BulkEmailComponent, canActivate: [roleGuard('dashboard')] },
      { path: 'crm', component: Crm, canActivate: [roleGuard('dashboard')] },
      { path: 'amazon', component: Amazon, canActivate: [roleGuard('amazon')] },
    ]
  },
  { path: '**', redirectTo: '' }
];
