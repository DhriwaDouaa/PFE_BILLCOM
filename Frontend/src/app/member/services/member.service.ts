import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/services/api.service';
import { Member } from '../models/member.model';

@Injectable({ providedIn: 'root' })
export class MemberService extends ApiService {
  getProfile(): Observable<Member> {
    const custId = localStorage.getItem('custId') || '1';
    return this.get<Member>(`customers/${custId}`);
  }
}
