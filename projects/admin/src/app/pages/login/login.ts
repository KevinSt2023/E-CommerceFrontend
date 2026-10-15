import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ax-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements AfterViewInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showPass = signal(false);
  readonly needs2fa = signal(false);
  private twoFaToken = '';

  readonly googleBtn = viewChild<ElementRef<HTMLDivElement>>('googleBtn');
  readonly googleEnabled = !!environment.googleClientId;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  twoFaForm = this.fb.group({ code: ['', [Validators.required, Validators.minLength(6)]] });

  submit() {
    this.errorMsg.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: (r) => {
        if (r.requiresTwoFactor && r.twoFactorToken) {
          this.twoFaToken = r.twoFactorToken;
          this.needs2fa.set(true);
          this.submitting.set(false);
        } else {
          this.afterLogin();
        }
      },
      error: (e) => this.fail(e, 'Correo o contraseña incorrectos.'),
    });
  }

  submitTwoFa() {
    this.errorMsg.set(null);
    if (this.twoFaForm.invalid) { this.twoFaForm.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.auth.verifyTwoFactor(this.twoFaToken, this.twoFaForm.value.code!.trim()).subscribe({
      next: () => this.afterLogin(),
      error: (e) => this.fail(e, 'Código incorrecto.'),
    });
  }

  private async afterLogin() {
    await this.auth.loadProfile();
    if (!this.auth.isStaff()) {
      // Clientes no acceden al panel.
      this.auth.logout().subscribe();
      this.submitting.set(false);
      this.needs2fa.set(false);
      this.errorMsg.set('Esta cuenta no tiene acceso al panel de administración.');
      return;
    }
    this.router.navigateByUrl('/');
  }

  private fail(e: any, fallback: string) {
    this.submitting.set(false);
    this.errorMsg.set(e?.error?.detail ?? fallback);
  }

  ngAfterViewInit() {
    this.initGoogle();
  }

  private initGoogle(attempt = 0) {
    if (!this.googleEnabled) return;
    const g = (window as any).google;
    const host = this.googleBtn()?.nativeElement;
    if (!g?.accounts?.id || !host) {
      if (attempt < 20) setTimeout(() => this.initGoogle(attempt + 1), 250);
      return;
    }
    g.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (resp: any) => this.onGoogle(resp.credential),
    });
    g.accounts.id.renderButton(host, { theme: 'filled_black', size: 'large', width: 300, text: 'continue_with', locale: 'es' });
  }

  private onGoogle(idToken: string) {
    this.errorMsg.set(null);
    this.submitting.set(true);
    this.auth.googleLogin(idToken).subscribe({
      next: () => this.afterLogin(),
      error: (e) => this.fail(e, 'No se pudo iniciar sesión con Google.'),
    });
  }
}
