import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ax-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements AfterViewInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly googleBtn = viewChild<ElementRef<HTMLDivElement>>('googleBtn');
  readonly googleEnabled = !!environment.googleClientId;

  readonly mode = signal<'login' | 'register'>('login');
  readonly submitting = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showPass = signal(false);
  readonly needs2fa = signal(false);
  private twoFaToken = '';

  private returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/cuenta';

  twoFaForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6)]],
  });

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.pattern(/^\d{6,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
  });

  setMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.errorMsg.set(null);
  }

  invalid(form: 'login' | 'register', ctrl: string): boolean {
    const group: FormGroup = form === 'login' ? this.loginForm : this.registerForm;
    const c = group.get(ctrl);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  submitLogin() {
    this.errorMsg.set(null);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const { email, password } = this.loginForm.value;
    this.auth.login(email!, password!).subscribe({
      next: (r) => {
        if (r.requiresTwoFactor && r.twoFactorToken) {
          this.twoFaToken = r.twoFactorToken;
          this.needs2fa.set(true);
          this.submitting.set(false);
        } else {
          this.afterAuth();
        }
      },
      error: (err) => this.fail(err, 'Correo o contraseña incorrectos.'),
    });
  }

  submitTwoFa() {
    this.errorMsg.set(null);
    if (this.twoFaForm.invalid) {
      this.twoFaForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.auth.verifyTwoFactor(this.twoFaToken, this.twoFaForm.value.code!.trim()).subscribe({
      next: () => this.afterAuth(),
      error: (err) => this.fail(err, 'Código incorrecto.'),
    });
  }

  cancelTwoFa() {
    this.needs2fa.set(false);
    this.twoFaForm.reset();
    this.errorMsg.set(null);
  }

  submitRegister() {
    this.errorMsg.set(null);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.auth.register(this.registerForm.value as any).subscribe({
      next: () => this.afterAuth(),
      error: (err) => this.fail(err, 'No se pudo crear la cuenta.'),
    });
  }

  private afterAuth() {
    // Fusiona el carrito de invitado y navega al destino.
    this.cart.mergeGuestCart().subscribe({
      next: () => this.go(),
      error: () => this.go(),
    });
  }

  private go() {
    this.submitting.set(false);
    this.router.navigateByUrl(this.returnUrl);
  }

  private fail(err: any, fallback: string) {
    this.submitting.set(false);
    this.errorMsg.set(err?.error?.detail ?? fallback);
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
    g.accounts.id.renderButton(host, { theme: 'filled_black', size: 'large', width: 320, text: 'continue_with', locale: 'es' });
  }

  private onGoogle(idToken: string) {
    this.errorMsg.set(null);
    this.submitting.set(true);
    this.auth.googleLogin(idToken).subscribe({
      next: () => this.afterAuth(),
      error: (e) => this.fail(e, 'No se pudo iniciar sesión con Google.'),
    });
  }
}
