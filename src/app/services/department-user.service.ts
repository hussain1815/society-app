import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentUserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDepartmentUsers(page: number = 1, pageSize: number = 10, search: string = '', gender: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (gender) {
      params = params.set('gender', gender);
    }

    return this.http.get(`${this.apiUrl}/department-users/`, { params });
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/department-users/`, data);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/department-users/${id}/`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/department-users/${id}/`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/department-users/${id}/`);
  }
}
