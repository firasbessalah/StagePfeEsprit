import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wave-separator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wave-separator.component.html',
  styleUrls: ['./wave-separator.component.scss']
})
export class WaveSeparatorComponent {
  @Input() topColor = '#ffffff';
  @Input() bottomColor = '#000080';
  @Input() shape: 'curve' | 'flat' = 'flat';
}
