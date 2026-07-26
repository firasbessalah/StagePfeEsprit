import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from 'src/app/core/pipes/translate.pipe';
import { WaveSeparatorComponent } from '../shared/wave-separator/wave-separator.component';

@Component({
  selector: 'app-home-info-blocks',
  standalone: true,
  imports: [CommonModule, TranslatePipe, WaveSeparatorComponent],
  templateUrl: './home-info-blocks.component.html',
  styleUrls: ['./home-info-blocks.component.scss']
})
export class HomeInfoBlocksComponent {}
