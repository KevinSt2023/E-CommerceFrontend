import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then((m) => m.Home), title: 'ALTEXA · Tu Tienda Online' },
  { path: 'catalogo', loadComponent: () => import('./pages/catalog/catalog').then((m) => m.Catalog), title: 'Catálogo · ALTEXA' },
  {
    path: 'producto/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  { path: 'carrito', loadComponent: () => import('./pages/cart-page/cart-page').then((m) => m.CartPage), title: 'Carrito · ALTEXA' },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout), title: 'Checkout · ALTEXA' },
  { path: 'pago/:orderNumber', loadComponent: () => import('./pages/payment/payment').then((m) => m.Payment), title: 'Pago · ALTEXA' },
  {
    path: 'pedido/:orderNumber',
    loadComponent: () => import('./pages/order-confirmation/order-confirmation').then((m) => m.OrderConfirmation),
    title: 'Pedido · ALTEXA',
  },
  { path: 'cuenta/login', loadComponent: () => import('./pages/login/login').then((m) => m.Login), title: 'Ingresar · ALTEXA' },
  {
    path: 'cuenta',
    loadComponent: () => import('./pages/account/account').then((m) => m.Account),
    canActivate: [authGuard],
    title: 'Mi cuenta · ALTEXA',
  },
  { path: '**', redirectTo: '' },
];
