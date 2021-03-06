import {Injectable} from '@angular/core';
import {mainLink} from '../../links';
import {HttpClient} from '@angular/common/http';
import {RestoreDto} from '../../model/restroreDto';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ChangePasswordService {
  public apiUrl = `${mainLink}ownSecurity`;

  constructor(
    protected http: HttpClient,
  ) {}

  public restorePassword(dto: RestoreDto): Observable<object> {
    return this.http.post<object>(`${this.apiUrl}/changePassword`, dto);
  }
}
