import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPets(page: number = 1, pageSize: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get(`${this.apiUrl}/pets/`, { params });
  }
}
