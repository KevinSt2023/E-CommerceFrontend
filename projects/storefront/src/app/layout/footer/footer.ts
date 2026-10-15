import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ax-footer',
  imports: [RouterLink],
  template: `
    <footer class="ft">
      <div class="ax-container ft-grid">
        <div class="ft-brand">
          <span class="ax-wordmark ft-logo">ALTE<span class="ax-x">X</span>A</span>
          <p>Tu tienda online de tecnología, gaming y electrónica. Las mejores marcas, garantía oficial y envíos a todo el Perú.</p>
          <div class="socials">
            <a aria-label="Facebook"><i class="pi pi-facebook"></i></a>
            <a aria-label="Instagram"><i class="pi pi-instagram"></i></a>
            <a aria-label="TikTok"><i class="pi pi-tiktok"></i></a>
            <a aria-label="WhatsApp"><i class="pi pi-whatsapp"></i></a>
          </div>
        </div>

        <div class="ft-col">
          <h4>Comprar</h4>
          <a routerLink="/catalogo">Catálogo</a>
          <a [routerLink]="['/catalogo']" [queryParams]="{ ofertas: true }">Ofertas</a>
          <a [routerLink]="['/catalogo']" [queryParams]="{ categoria: 'laptops' }">Laptops</a>
          <a [routerLink]="['/catalogo']" [queryParams]="{ categoria: 'componentes' }">Componentes</a>
        </div>

        <div class="ft-col">
          <h4>Ayuda</h4>
          <a routerLink="/ayuda">Centro de ayuda</a>
          <a routerLink="/cuenta">Rastrea tu pedido</a>
          <a>Garantías y devoluciones</a>
          <a>Libro de reclamaciones</a>
        </div>

        <div class="ft-col">
          <h4>Pagos seguros</h4>
          <div class="pays">
            <span><i class="pi pi-credit-card"></i> Visa</span>
            <span><i class="pi pi-credit-card"></i> Mastercard</span>
            <span><i class="pi pi-wallet"></i> Yape</span>
            <span><i class="pi pi-money-bill"></i> PagoEfectivo</span>
          </div>
          <p class="secure"><i class="pi pi-lock"></i> Compra 100% protegida</p>
        </div>
      </div>

      <div class="ft-bottom">
        <div class="ax-container ft-bottom-inner">
          <span>© {{ year }} ALTEXA · Tu Tienda Online. Todos los derechos reservados.</span>
          <span>Hecho en Perú 🇵🇪</span>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .ft { background: #0a0a0c; border-top: 1px solid var(--ax-border); margin-top: 40px; }
      .ft-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1.3fr;
        gap: 40px;
        padding: 48px 20px 36px;
      }
      .ft-logo { font-size: 1.5rem; }
      .ft-brand p { color: var(--ax-text-dim); font-size: 0.86rem; margin: 14px 0 18px; max-width: 320px; }
      .socials { display: flex; gap: 10px; }
      .socials a {
        width: 38px; height: 38px; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        background: var(--ax-surface); border: 1px solid var(--ax-border);
        color: var(--ax-text-dim); cursor: pointer; transition: all 0.18s;
      }
      .socials a:hover { color: #fff; border-color: var(--ax-red); background: rgba(255, 30, 45, 0.1); }
      .ft-col h4 { font-size: 0.95rem; margin-bottom: 14px; }
      .ft-col a { display: block; color: var(--ax-text-dim); font-size: 0.85rem; padding: 5px 0; cursor: pointer; }
      .ft-col a:hover { color: var(--ax-red); }
      .pays { display: flex; flex-direction: column; gap: 8px; }
      .pays span { color: var(--ax-text-dim); font-size: 0.84rem; }
      .pays i { color: var(--ax-silver-dim); margin-right: 7px; }
      .secure { color: #2ecc71; font-size: 0.82rem; margin-top: 14px; }
      .ft-bottom { border-top: 1px solid var(--ax-border-soft); }
      .ft-bottom-inner {
        display: flex; justify-content: space-between; align-items: center;
        padding: 16px 20px; font-size: 0.8rem; color: var(--ax-text-muted);
      }
      @media (max-width: 860px) {
        .ft-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
        .ft-brand { grid-column: 1 / -1; }
      }
      @media (max-width: 520px) {
        .ft-grid { grid-template-columns: 1fr; }
        .ft-bottom-inner { flex-direction: column; gap: 6px; text-align: center; }
      }
    `,
  ],
})
export class Footer {
  readonly year = new Date().getFullYear();
}
