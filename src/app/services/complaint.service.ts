import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getComplaints(page: number = 1, pageSize: number = 10, search: string = '', priority?: string, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    if (priority) {
      params = params.set('priority', priority);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get(`${this.apiUrl}/complaints/`, { params });
  }

  updateComplaintStatus(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/complaints/${id}/`, data);
  }
}
