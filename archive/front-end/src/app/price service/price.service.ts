import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prices, Result } from '../types';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private optionUrl = 'https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey=IgK0HfSocsI2nB9ykRJ9QDkqJarPqVkJ';

  constructor(private http: HttpClient) { }

  getPrices(): Observable<Prices[]> {
    return this.http.get<Prices[]>(this.optionUrl)
  }
}

