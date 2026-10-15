import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { OrderService } from '../../core/order.service';
import { SettingsService } from '../../core/settings.service';
import { CreateOrderPayload } from '../../core/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ax-checkout',
  imports: [ReactiveFormsModule, DecimalPipe, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private orders = inject(OrderService);
  private router = inject(Router);
  readonly cartService = inject(CartService);
  readonly settings = inject(SettingsService);
  readonly cart = this.cartService.cart;

  readonly submitting = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly departments = [
    'Amazonas','Áncash','Apurímac','Arequipa','Ayacucho','Cajamarca','Callao','Cusco',
    'Huancavelica','Huánuco','Ica','Junín','La Libertad','Lambayeque','Lima','Loreto',
    'Madre de Dios','Moquegua','Pasco','Piura','Puno','San Martín','Tacna','Tumbes','Ucayali',
  ];

  // Métodos de pago disponibles según la configuración del negocio (admin).
  readonly payments = computed(() => {
    const s = this.settings.settings();
    const all = [
      { value: 'Stripe', label: 'Tarjeta de crédito / débito', icon: 'pi pi-credit-card', desc: 'Visa, Mastercard, Amex', enabled: s.payCardEnabled },
      { value: 'BankTransfer', label: 'Transferencia bancaria', icon: 'pi pi-building-columns', desc: 'BCP, Interbank, BBVA', enabled: s.payTransferEnabled },
      { value: 'CashOnDelivery', label: 'Pago contra entrega', icon: 'pi pi-money-bill', desc: 'Paga al recibir', enabled: s.payCashOnDeliveryEnabled },
    ];
    return all.filter((p) => p.enabled);
  });
  readonly bank = computed(() => this.settings.settings());

  readonly shipping = computed(() => this.settings.shippingFor(this.cart()?.subtotal ?? 0));
  readonly grandTotal = computed(() => (this.cart()?.total ?? 0) + this.shipping());

  form = this.fb.group({
    customerName: ['', [Validators.required, Validators.maxLength(200)]],
    customerEmail: ['', [Validators.required, Validators.email]],
    customerPhone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
    requestedDocument: ['Boleta', Validators.required],
    customerDocumentType: ['Dni', Validators.required],
    customerDocumentNumber: ['', [Validators.pattern(/^\d{8}$/)]],
    shippingRecipient: ['', [Validators.required, Validators.maxLength(150)]],
    shippingLine1: ['', [Validators.required, Validators.maxLength(250)]],
    shippingLine2: [''],
    shippingDepartment: ['Lima', Validators.required],
    shippingProvince: ['', [Validators.required, Validators.maxLength(100)]],
    shippingDistrict: ['', [Validators.required, Validators.maxLength(100)]],
    paymentMethod: ['Stripe', Validators.required],
    notes: [''],
  });

  constructor() {
    this.cartService.load();
    // Si el método por defecto (tarjeta) está desactivado, usa el primero disponible.
    const available = this.payments();
    if (available.length && !available.some((p) => p.value === this.form.value.paymentMethod)) {
      this.form.controls.paymentMethod.setValue(available[0].value);
    }
    this.form.controls.requestedDocument.valueChanges.subscribe((doc) => {
      const typeCtrl = this.form.controls.customerDocumentType;
      const numCtrl = this.form.controls.customerDocumentNumber;
      if (doc === 'Factura') {
        typeCtrl.setValue('Ruc', { emitEvent: false });
        numCtrl.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
      } else {
        typeCtrl.setValue('Dni', { emitEvent: false });
        numCtrl.setValidators([Validators.pattern(/^\d{8}$/)]);
      }
      numCtrl.updateValueAndValidity();
    });
  }

  isInvalid(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  selectPayment(value: string) {
    this.form.controls.paymentMethod.setValue(value);
  }

  submit() {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg.set('Revisa los campos marcados en rojo.');
      return;
    }
    if (!this.cart() || this.cart()!.items.length === 0) {
      this.errorMsg.set('Tu carrito está vacío.');
      return;
    }

    this.submitting.set(true);
    const payload = this.form.value as CreateOrderPayload;
    this.orders.createOrder(payload).subscribe({
      next: (order) => {
        this.cartService.load();
        // Con tarjeta (Stripe) va a la página de pago SOLO si Stripe está habilitado;
        // si no, el pedido queda registrado (pendiente) y va a la confirmación.
        if (payload.paymentMethod === 'Stripe' && environment.stripeEnabled) {
          this.router.navigate(['/pago', order.orderNumber]);
        } else {
          this.router.navigate(['/pedido', order.orderNumber]);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.detail ?? 'No se pudo crear el pedido. Intenta nuevamente.');
      },
    });
  }
}
