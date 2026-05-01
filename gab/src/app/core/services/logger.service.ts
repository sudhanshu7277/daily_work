import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  debug(...args: unknown[]): void {
    if (!environment.production) {
      // eslint-disable-next-line no-console
      console.debug(...args);
    }
  }
  info(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.info(...args);
  }
  warn(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
  error(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
}
