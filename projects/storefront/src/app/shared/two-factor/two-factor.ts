import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import QRCode from 'qrcode';
import { AuthService } from '../../core/auth.service';

type State = 'idle' | 'setup' | 'recovery' | 'disabling';

@Component({
  selector: 'ax-two-factor',
  imports: [FormsModule],
  templateUrl: './two-factor.html',
  styleUrl: './two-factor.scss',
})
export class TwoFactor {
  private auth = inject(AuthService);

  enabled = input<boolean>(false);
  changed = output<void>();

  readonly state = signal<State>('idle');
  readonly busy = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly secret = signal('');
  readonly qrDataUrl = signal<string | null>(null);
  readonly recoveryCodes = signal<string[]>([]);
  readonly copied = signal(false);

  code = '';

  startSetup() {
    this.reset();
    this.busy.set(true);
    this.auth.setupTwoFactor().subscribe({
      next: async (s) => {
        this.secret.set(s.secret);
        try {
          this.qrDataUrl.set(await QRCode.toDataURL(s.otpauthUri, { margin: 1, width: 220 }));
        } catch { /* QR opcional */ }
        this.state.set('setup');
        this.busy.set(false);
      },
      error: (e) => this.fail(e, 'No se pudo iniciar la configuración.'),
    });
  }

  confirmEnable() {
    if (!/^\d{6}$/.test(this.code.trim())) {
      this.errorMsg.set('Ingresa el código de 6 dígitos.');
      return;
    }
    this.busy.set(true);
    this.errorMsg.set(null);
    this.auth.enableTwoFactor(this.code.trim()).subscribe({
      next: (r) => {
        this.recoveryCodes.set(r.recoveryCodes);
        this.state.set('recovery');
        this.busy.set(false);
        this.code = '';
      },
      error: (e) => this.fail(e, 'Código incorrecto.'),
    });
  }

  startDisable() {
    this.reset();
    this.state.set('disabling');
  }

  confirmDisable() {
    if (!/^\d{6}$/.test(this.code.trim())) {
      this.errorMsg.set('Ingresa el código de 6 dígitos.');
      return;
    }
    this.busy.set(true);
    this.errorMsg.set(null);
    this.auth.disableTwoFactor(this.code.trim()).subscribe({
      next: () => {
        this.reset();
        this.changed.emit();
      },
      error: (e) => this.fail(e, 'Código incorrecto.'),
    });
  }

  finishRecovery() {
    this.reset();
    this.changed.emit();
  }

  copyCodes() {
    const text = this.recoveryCodes().join('\n');
    navigator.clipboard?.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  cancel() {
    this.reset();
  }

  private reset() {
    this.state.set('idle');
    this.busy.set(false);
    this.errorMsg.set(null);
    this.secret.set('');
    this.qrDataUrl.set(null);
    this.recoveryCodes.set([]);
    this.code = '';
  }

  private fail(e: any, fallback: string) {
    this.busy.set(false);
    this.errorMsg.set(e?.error?.detail ?? fallback);
  }
}
