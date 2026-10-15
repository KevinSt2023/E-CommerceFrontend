import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { SettingsService } from '../../core/settings.service';

@Component({
  selector: 'ax-cart-page',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  readonly cartService = inject(CartService);
  readonly settings = inject(SettingsService);
  readonly cart = this.cartService.cart;

  readonly freeShippingThreshold = this.settings.freeShippingThreshold;
  readonly shipping = computed(() => this.settings.shippingFor(this.cart()?.subtotal ?? 0));
  readonly missingForFreeShipping = computed(() =>
    Math.max(0, this.settings.freeShippingThreshold() - (this.cart()?.subtotal ?? 0)),
  );
  readonly grandTotal = computed(() => (this.cart()?.total ?? 0) + this.shipping());

  constructor() {
    this.cartService.load();
  }

  inc(productId: string, current: number, max: number) {
    this.cartService.updateQuantity(productId, Math.min(current + 1, max || current + 1)).subscribe();
  }
  dec(productId: string, current: number) {
    if (current <= 1) return;
    this.cartService.updateQuantity(productId, current - 1).subscribe();
  }
  remove(productId: string) {
    this.cartService.remove(productId).subscribe();
  }
  clear() {
    this.cartService.clear().subscribe();
  }
}
