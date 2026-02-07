pnpm add primeng primeicons

"styles": [
  "./node_modules/primeicons/primeicons.css",
  "./node_modules/primeng/resources/themes/lara-light-blue/theme.css",
  "./node_modules/primeng/resources/primeng.min.css",
  "src/styles.scss"
]
add to .npmrc

public-hoist-pattern[]=*primeng*

run : pnpm add primeng primeicons @primeng/themes

run: pnpm install --shamefully-flatten

app.config.ts
=============

import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura'; // You can also use Lara or Nora

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimationsAsync(),
        providePrimeNG({ 
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.my-app-dark' // Optional: controls dark mode
                }
            }
        })
    ]
};