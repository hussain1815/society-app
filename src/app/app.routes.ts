import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SuperadminDashboardComponent } from './components/superadmin-dashboard/superadmin-dashboard.component';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { ManageMembershipComponent } from './components/manage-membership/manage-membership.component';
import { ManagePlotsComponent } from './components/manage-plots/manage-plots.component';
import { ManageDepartmentUsersComponent } from './components/manage-department-users/manage-department-users.component';
import { ManageDepartmentComponent } from './components/manage-department/manage-department.component';
import { ManagePetsComponent } from './components/manage-pets/manage-pets.component';
import { ManageComplainsComponent } from './components/manage-complains/manage-complains.component';
import { AdminLayoutComponent } from './components/layout/admin-layout/admin-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: SuperadminDashboardComponent },
      { path: 'users', component: ManageUsersComponent },
      { path: 'membership', component: ManageMembershipComponent },
      { path: 'plots', component: ManagePlotsComponent },
      { path: 'department-users', component: ManageDepartmentUsersComponent },
      { path: 'departments', component: ManageDepartmentComponent },
      { path: 'pets', component: ManagePetsComponent },
      { path: 'complains', component: ManageComplainsComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
