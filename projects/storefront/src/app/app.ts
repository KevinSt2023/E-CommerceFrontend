import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  template: `
    <ax-header />
    <main class="app-main">
      <router-outlet />
    </main>
    <ax-footer />
  `,
  styles: [`.app-main { min-height: 60vh; }`],
})
export class App {}
