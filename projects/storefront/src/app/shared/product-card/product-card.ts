import { Component, inject, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductListItem } from '../../core/models';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'ax-product-card',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  private cart = inject(CartService);
  product = input.required<ProductListItem>();

  readonly adding = signal(false);
  readonly added = signal(false);

  add(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.adding()) return;
    this.adding.set(true);
    this.cart.add(this.product().id, 1).subscribe({
      next: () => {
        this.adding.set(false);
        this.added.set(true);
        setTimeout(() => this.added.set(false), 1600);
      },
      error: () => this.adding.set(false),
    });
  }
}
