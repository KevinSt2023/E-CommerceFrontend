import { Routes } from '@angular/router';
import { adminGuard, authGuard, twoFactorGuard } from './core/guards';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login), title: 'Ingresar · ALTEXA Admin' },
  {
    path: 'activar-2fa',
    loadComponent: () => import('./pages/setup-2fa/setup-2fa').then((m) => m.Setup2fa),
    canActivate: [authGuard],
    title: 'Activar 2FA · ALTEXA Admin',
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    canActivate: [authGuard, twoFactorGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard), title: 'Dashboard · ALTEXA Admin' },
      { path: 'pedidos', loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders), title: 'Pedidos · ALTEXA Admin' },
      { path: 'pedidos/:orderNumber', loadComponent: () => import('./pages/order-detail/order-detail').then((m) => m.OrderDetail), title: 'Pedido · ALTEXA Admin' },
      { path: 'pedidos/:orderNumber/comprobante', loadComponent: () => import('./pages/comprobante/comprobante').then((m) => m.Comprobante), title: 'Comprobante · ALTEXA Admin' },
      { path: 'inventario', loadComponent: () => import('./pages/inventory/inventory').then((m) => m.Inventory), title: 'Inventario · ALTEXA Admin' },
      { path: 'productos', loadComponent: () => import('./pages/products/products').then((m) => m.Products), title: 'Productos · ALTEXA Admin' },
      { path: 'productos/nuevo', loadComponent: () => import('./pages/product-form/product-form').then((m) => m.ProductForm), title: 'Nuevo producto · ALTEXA Admin' },
      { path: 'productos/:id/editar', loadComponent: () => import('./pages/product-form/product-form').then((m) => m.ProductForm), title: 'Editar producto · ALTEXA Admin' },
      { path: 'categorias', loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories), title: 'Categorías · ALTEXA Admin' },
      { path: 'marcas', loadComponent: () => import('./pages/brands/brands').then((m) => m.Brands), title: 'Marcas · ALTEXA Admin' },
      { path: 'cupones', loadComponent: () => import('./pages/coupons/coupons').then((m) => m.Coupons), title: 'Cupones · ALTEXA Admin' },
      { path: 'usuarios', loadComponent: () => import('./pages/users/users').then((m) => m.Users), canActivate: [adminGuard], title: 'Usuarios · ALTEXA Admin' },
      { path: 'configuracion', loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings), canActivate: [adminGuard], title: 'Configuración · ALTEXA Admin' },
    ],
  },
  { path: '**', redirectTo: '' },
];
