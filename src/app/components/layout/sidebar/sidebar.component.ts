import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  userRole: string = '';
  userName: string = '';
  userEmail: string = '';

  menuItems: MenuItem[] = [];

  allMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fa-home', route: '/admin', roles: ['superadmin', 'accounts'] },
    { label: 'Manage Users', icon: 'fa-users', route: '/admin/users', roles: ['superadmin'] },
    { label: 'Manage Plots', icon: 'fa-map-marked-alt', route: '/admin/plots', roles: ['superadmin', 'accounts'] },
    { label: 'Manage Membership', icon: 'fa-id-card', route: '/admin/membership', roles: ['superadmin', 'accounts'] },
    { label: 'Manage Pets', icon: 'fa-paw', route: '/admin/pets', roles: ['superadmin', 'accounts'] },
    { label: 'Manage SOs Alerts', icon: 'fa-bell', route: '/admin/sos-alerts', roles: ['superadmin', 'accounts'] },
    { label: 'Manage Complains', icon: 'fa-thumbs-up', route: '/admin/complains', roles: ['superadmin', 'accounts'] },
    { label: 'Manage Department', icon: 'fa-sitemap', route: '/admin/departments', roles: ['superadmin'] },
    { label: 'Manage Department Users', icon: 'fa-user-tie', route: '/admin/department-users', roles: ['superadmin'] },
    { label: 'Manage Billing', icon: 'fa-file-invoice-dollar', route: '/admin/billing', roles: ['superadmin', 'accounts'] },
    { label: 'Announcements', icon: 'fa-bullhorn', route: '/admin/announcements', roles: ['superadmin', 'accounts'] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userRole = user.role;
      this.userName = `${user.first_name} ${user.last_name}`.trim() || user.email;
      this.userEmail = user.email;

      // Filter menu items based on role
      this.menuItems = this.allMenuItems.filter(item => 
        item.roles.includes(this.userRole)
      );
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
