import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import QRCode from 'qrcode';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'ax-setup-2fa',
  imports: [FormsModule],
  templateUrl: './setup-2fa.html',
  styleUrl: './setup-2fa.scss',
})
export class Setup2fa {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly step = signal<'intro' | 'scan' | 'recovery'>('intro');
  readonly busy = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly secret = signal('');
  readonly qr = signal<string | null>(null);
  readonly recoveryCodes = signal<string[]>([]);
  code = '';

  start() {
    this.busy.set(true);
    this.errorMsg.set(null);
    this.auth.setupTwoFactor().subscribe({
      next: async (s) => {
        this.secret.set(s.secret);
        try { this.qr.set(await QRCode.toDataURL(s.otpauthUri, { margin: 1, width: 220 })); } catch {}
        this.step.set('scan');
        this.busy.set(false);
      },
      error: (e) => this.fail(e, 'No se pudo iniciar la configuración.'),
    });
  }

  confirm() {
    if (!/^\d{6}$/.test(this.code.trim())) { this.errorMsg.set('Ingresa el código de 6 dígitos.'); return; }
    this.busy.set(true);
    this.errorMsg.set(null);
    this.auth.enableTwoFactor(this.code.trim()).subscribe({
      next: (r) => {
        this.recoveryCodes.set(r.recoveryCodes);
        this.step.set('recovery');
        this.busy.set(false);
      },
      error: (e) => this.fail(e, 'Código incorrecto.'),
    });
  }

  async finish() {
    await this.auth.loadProfile();
    this.router.navigateByUrl('/');
  }

  logout() {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }

  private fail(e: any, fallback: string) {
    this.busy.set(false);
    this.errorMsg.set(e?.error?.detail ?? fallback);
  }
}
