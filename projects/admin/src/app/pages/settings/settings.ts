import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApi } from '../../core/admin-api.service';
import { StoreSettings } from '../../core/models';

type Tab = 'negocio' | 'comercio' | 'pagos' | 'facturacion';

@Component({
  selector: 'ax-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private api = inject(AdminApi);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly msg = signal<string | null>(null);
  readonly err = signal<string | null>(null);
  readonly tab = signal<Tab>('negocio');
  readonly uploadingLogo = signal(false);

  model: StoreSettings = this.blank();
  // IGV se edita como porcentaje (18) aunque se guarda como fracción (0.18)
  igvPercent = 18;

  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'negocio', label: 'Negocio', icon: 'pi pi-building' },
    { id: 'comercio', label: 'Envíos e IGV', icon: 'pi pi-truck' },
    { id: 'pagos', label: 'Pagos', icon: 'pi pi-credit-card' },
    { id: 'facturacion', label: 'Facturación', icon: 'pi pi-file' },
  ];

  constructor() { this.load(); }

  private blank(): StoreSettings {
    return {
      storeName: 'ALTEXA', currency: 'PEN', igvRate: 0.18, freeShippingThreshold: 300, defaultShippingCost: 15,
      payCardEnabled: true, payTransferEnabled: true, payCashOnDeliveryEnabled: true,
      invoicingEnabled: false, boletaSeries: 'B001', facturaSeries: 'F001',
    };
  }

  load() {
    this.loading.set(true);
    this.api.getSettings().subscribe({
      next: (s) => { this.model = s; this.igvPercent = Math.round((s.igvRate ?? 0.18) * 100); this.loading.set(false); },
      error: () => { this.err.set('No se pudo cargar la configuración.'); this.loading.set(false); },
    });
  }

  save() {
    this.saving.set(true); this.msg.set(null); this.err.set(null);
    this.model.igvRate = (this.igvPercent || 0) / 100;
    this.api.updateSettings(this.model).subscribe({
      next: (s) => { this.model = s; this.igvPercent = Math.round((s.igvRate ?? 0.18) * 100); this.saving.set(false); this.flash('Configuración guardada correctamente.'); },
      error: (e) => { this.saving.set(false); this.err.set(e?.error?.detail || e?.error?.title || 'No se pudo guardar. Revisa los datos.'); },
    });
  }

  /** Sube el logo de la marca desde la PC y guarda su URL pública en la configuración. */
  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.err.set(null);
    this.uploadingLogo.set(true);
    this.api.uploadImage(file).subscribe({
      next: (r) => { this.model.logoUrl = r.url; this.uploadingLogo.set(false); input.value = ''; this.flash('Logo cargado. Recuerda guardar los cambios.'); },
      error: (e) => { this.uploadingLogo.set(false); input.value = ''; this.err.set(e?.error?.detail || 'No se pudo subir el logo (JPG/PNG/WEBP, máx. 5 MB).'); },
    });
  }

  removeLogo() { this.model.logoUrl = undefined; }

  private flash(m: string) { this.msg.set(m); setTimeout(() => this.msg.set(null), 3500); }
}
