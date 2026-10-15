import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { OrderService } from '../../core/order.service';
import { PaymentService } from '../../core/payment.service';
import { OrderDto } from '../../core/models';

@Component({
  selector: 'ax-payment',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment implements AfterViewInit {
  private route = inject(ActivatedRoute);
  private orders = inject(OrderService);
  private payments = inject(PaymentService);

  private payEl = viewChild<ElementRef<HTMLDivElement>>('payEl');

  readonly order = signal<OrderDto | null>(null);
  readonly loading = signal(true);
  readonly ready = signal(false);
  readonly processing = signal(false);
  readonly errorMsg = signal<string | null>(null);

  private orderNumber = '';
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  ngAfterViewInit() {
    this.orderNumber = this.route.snapshot.paramMap.get('orderNumber')!;
    this.orders.getByNumber(this.orderNumber).subscribe({
      next: (o) => {
        this.order.set(o);
        if (o.paymentStatus === 'Paid') {
          // Ya pagado: nada que cobrar.
          this.loading.set(false);
          return;
        }
        this.initStripe();
      },
      error: () => {
        this.errorMsg.set('No se pudo cargar el pedido.');
        this.loading.set(false);
      },
    });
  }

  private initStripe() {
    this.payments.createIntent(this.orderNumber).subscribe({
      next: async (intent) => {
        try {
          this.stripe = await loadStripe(intent.publishableKey);
          if (!this.stripe) throw new Error('Stripe no se pudo inicializar.');
          this.elements = this.stripe.elements({
            clientSecret: intent.clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#ff1e2d',
                colorBackground: '#141418',
                colorText: '#edeff3',
                borderRadius: '10px',
                fontFamily: 'Inter, sans-serif',
              },
            },
          });
          const paymentElement = this.elements.create('payment');
          this.loading.set(false);
          this.ready.set(true);
          // Montar tras render del contenedor.
          queueMicrotask(() => {
            const host = this.payEl()?.nativeElement;
            if (host) paymentElement.mount(host);
          });
        } catch (e: any) {
          this.errorMsg.set(e?.message ?? 'Error al preparar el pago.');
          this.loading.set(false);
        }
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.detail ?? 'No se pudo iniciar el pago.');
        this.loading.set(false);
      },
    });
  }

  async pay() {
    if (!this.stripe || !this.elements || this.processing()) return;
    this.processing.set(true);
    this.errorMsg.set(null);

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: `${location.origin}/pedido/${this.orderNumber}`,
      },
    });

    // Si hay error inmediato (validación/tarjeta rechazada) no hay redirección.
    if (error) {
      this.errorMsg.set(error.message ?? 'El pago no pudo completarse.');
      this.processing.set(false);
    }
  }
}
