import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlotService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPlots(page: number = 1, pageSize: number = 10, plotStatus: string = '', plotType: string = '', search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (plotStatus) {
      params = params.set('plot_status', plotStatus);
    }

    if (plotType) {
      params = params.set('plot_type', plotType);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get(`${this.apiUrl}/plots/`, { params });
  }

  createPlot(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/plots/`, data);
  }

  updatePlot(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/plots/${id}/`, data);
  }

  deletePlot(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/plots/${id}/`);
  }

  getMembershipDropdown(): Observable<any> {
    return this.http.get(`${this.apiUrl}/membership-numbers/dropdown/`);
  }
}
