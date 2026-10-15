import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface NavItem { label: string; icon: string; path?: string; adminOnly?: boolean; soon?: boolean; exact?: boolean; }

@Component({
  selector: 'ax-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly user = this.auth.user;
  readonly isAdmin = this.auth.isAdmin;
  readonly menuOpen = signal(false);

  readonly nav: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-chart-line', path: '', exact: true },
    { label: 'Pedidos', icon: 'pi pi-shopping-bag', path: 'pedidos' },
    { label: 'Inventario', icon: 'pi pi-box', path: 'inventario' },
    { label: 'Productos', icon: 'pi pi-tags', path: 'productos' },
    { label: 'Categorías', icon: 'pi pi-sitemap', path: 'categorias' },
    { label: 'Marcas', icon: 'pi pi-bookmark', path: 'marcas' },
    { label: 'Cupones', icon: 'pi pi-ticket', path: 'cupones' },
    { label: 'Usuarios', icon: 'pi pi-users', path: 'usuarios', adminOnly: true },
    { label: 'Configuración', icon: 'pi pi-cog', path: 'configuracion', adminOnly: true },
  ];

  get visibleNav() {
    return this.nav.filter((n) => !n.adminOnly || this.isAdmin());
  }

  roleLabel(): string {
    const r = this.user()?.role;
    return r === 'Admin' ? 'Administrador' : r === 'Staff' ? 'Vendedor' : (r ?? '');
  }

  logout() {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }
}
