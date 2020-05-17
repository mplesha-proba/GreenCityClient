import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of, Subject } from 'rxjs';
import { SearchModel } from '../../model/search/search.model';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private backEndLink = environment.backendLink;
  public SearchEmitter = new Subject<boolean>();

  public getSearch(searchQuery: string): Observable<SearchModel> {
    return this.http.get<SearchModel>(`${this.backEndLink}search?searchQuery=${searchQuery}`).pipe(
      switchMap(res => of(res))
    );
  }

  public openSearchSignal() {
    this.SearchEmitter.next(true);
  }

  public closeSearchSignal() {
    this.SearchEmitter.next(false);
  }

  constructor(private http: HttpClient) { }
}
