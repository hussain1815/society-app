import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDepartments(page: number = 1, pageSize: number = 10, search: string = '', isActive?: boolean): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (isActive !== undefined) {
      params = params.set('is_active', isActive.toString());
    }

    return this.http.get(`${this.apiUrl}/departments/`, { params });
  }

  createDepartment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/departments/`, data);
  }

  getDepartmentUsersDropdown(userId?: number): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('user_id', userId.toString());
    }
    return this.http.get(`${this.apiUrl}/department-users/dropdown/`, { params });
  }

  getDepartmentById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/departments/${id}/`);
  }

  updateDepartment(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/departments/${id}/`, data);
  }
}
