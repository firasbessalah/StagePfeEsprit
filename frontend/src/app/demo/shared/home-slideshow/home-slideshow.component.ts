import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SlideImage {
  url: string;
  title: string;
}

@Component({
  selector: 'app-home-slideshow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-slideshow.component.html',
  styleUrls: ['./home-slideshow.component.scss']
})
export class HomeSlideshowComponent {
  slides: SlideImage[] = [
    { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=650&fit=crop', title: 'Luxury Villa' },
    { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=650&fit=crop', title: 'Modern Apartment' },
    { url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=650&fit=crop', title: 'Cozy Home' },
    { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=650&fit=crop', title: 'Beach House' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=650&fit=crop', title: 'City Studio' },
    { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=650&fit=crop', title: 'Penthouse' },
    { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=650&fit=crop', title: 'Country House' }
  ];

  currentIndex = signal(0);

  prevSlide(): void {
    this.currentIndex.update(idx => idx === 0 ? this.slides.length - 1 : idx - 1);
  }

  nextSlide(): void {
    this.currentIndex.update(idx => idx === this.slides.length - 1 ? 0 : idx + 1);
  }

  setSlide(index: number): void {
    this.currentIndex.set(index);
  }
}
