import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SuperadminDashboardComponent } from './components/superadmin-dashboard/superadmin-dashboard.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { ManageMembershipComponent } from './components/manage-membership/manage-membership.component';
import { ManagePlotsComponent } from './components/manage-plots/manage-plots.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: SuperadminDashboardComponent, 
    canActivate: [authGuard]
  },
  { 
    path: 'admin/users', 
    component: ManageUsersComponent, 
    canActivate: [authGuard]
  },
  { 
    path: 'admin/membership', 
    component: ManageMembershipComponent, 
    canActivate: [authGuard]
  },
  { 
    path: 'admin/plots', 
    component: ManagePlotsComponent, 
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
