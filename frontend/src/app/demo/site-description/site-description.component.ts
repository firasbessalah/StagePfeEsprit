import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';

@Component({
  selector: 'app-site-description',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './site-description.component.html',
  styleUrls: ['./site-description.component.scss']
})
export class SiteDescriptionComponent {}
