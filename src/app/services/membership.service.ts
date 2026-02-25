import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMembershipNumbers(page: number = 1, pageSize: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    // Only add search param if it's not empty
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get(`${this.apiUrl}/membership-numbers/`, { params });
  }

  createMembership(data: { echs_no: string; name: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/membership-numbers/`, data);
  }

  updateMembership(id: number, data: { echs_no: string; name: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/membership-numbers/${id}/`, data);
  }

  updateMembershipStatus(id: number, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/membership-numbers/${id}/`, { is_active: isActive });
  }

  deleteMembership(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/membership-numbers/${id}/`);
  }
}
