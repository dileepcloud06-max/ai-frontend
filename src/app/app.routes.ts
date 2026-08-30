import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout';
import { DashboardComponent } from './dashboard/dashboard';
import { WriteReviewComponent } from './write-review/write-review';
import { BulkEmailComponent } from './bulk-email/bulk-email';
import { HelpComponent } from './help/help';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'write-review', component: WriteReviewComponent },
      { path: 'bulk-email', component: BulkEmailComponent },
      { path: 'help', component: HelpComponent }
    ]
  }
];
