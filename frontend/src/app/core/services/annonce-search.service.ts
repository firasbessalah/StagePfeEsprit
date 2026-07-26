import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ParamMap } from '@angular/router';
import { AnnonceDTO } from 'src/app/admin-features/annonce-admin.service';

export interface AnnonceSearchCriteria {
  localisation: string;
  checkIn: string;
  checkOut: string;
  guests: string;
}

@Injectable({ providedIn: 'root' })
export class AnnonceSearchService {
  criteria = signal<AnnonceSearchCriteria>({
    localisation: '',
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  navigateToResults(router: Router, criteria?: Partial<AnnonceSearchCriteria>): void {
    const next = { ...this.criteria(), ...criteria };
    this.criteria.set(next);

    const queryParams: Record<string, string> = {};
    if (next.localisation.trim()) queryParams['localisation'] = next.localisation.trim();
    if (next.checkIn) queryParams['checkIn'] = next.checkIn;
    if (next.checkOut) queryParams['checkOut'] = next.checkOut;
    if (next.guests.trim()) queryParams['guests'] = next.guests.trim();

    router.navigate(['/search'], { queryParams });
  }

  fromQueryParams(params: ParamMap): AnnonceSearchCriteria {
    return {
      localisation: params.get('localisation') ?? '',
      checkIn: params.get('checkIn') ?? '',
      checkOut: params.get('checkOut') ?? '',
      guests: params.get('guests') ?? ''
    };
  }

  filterByDates(annonces: AnnonceDTO[], checkIn: string, checkOut: string): AnnonceDTO[] {
    if (!checkIn && !checkOut) return annonces;

    return annonces.filter((annonce) => {
      if (!annonce.disponibiliteDebut || !annonce.disponibiliteFin) return true;

      const availStart = new Date(annonce.disponibiliteDebut);
      const availEnd = new Date(annonce.disponibiliteFin);

      if (checkIn) {
        const reqStart = new Date(checkIn);
        if (availEnd < reqStart) return false;
      }

      if (checkOut) {
        const reqEnd = new Date(checkOut);
        if (availStart > reqEnd) return false;
      }

      return true;
    });
  }
}
