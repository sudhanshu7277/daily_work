/**
 * build-angular-element.mjs
 *
 * Builds the Angular Elements bundle for @citi-icg-179025/payment-flow-ui-lib
 * and outputs a single concatenated JS file into /public.
 *
 * Run with:  npm run build:angular-element
 *
 * What it does:
 *  1. Writes a temporary Angular app (main.ts + angular.json + tsconfig)
 *     into a .angular-element-build/ working directory
 *  2. Runs `ng build` inside that directory
 *  3. Concatenates the output chunks into public/ss-payment-flow-element.js
 *  4. Cleans up the temp directory
 *
 * Requirements:
 *  - @angular/cli must be in devDependencies (it is)
 *  - @citi-icg-179025/payment-flow-ui-lib must be in dependencies (it is)
 *  - Node 18+
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, '.angular-element-build');
const OUTPUT_FILE = path.join(ROOT, 'public', 'ss-payment-flow-element.js');

// ── 1. Create temp build directory ───────────────────────────────────────────
console.log('\n📁 Setting up Angular Elements build directory...');
fs.rmSync(BUILD_DIR, { recursive: true, force: true });
fs.mkdirSync(path.join(BUILD_DIR, 'src'), { recursive: true });

// ── 2. Write main.ts ─────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(BUILD_DIR, 'src', 'main.ts'),
  `import 'zone.js';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SSPaymentMakerComponent } from '@citi-icg-179025/payment-flow-ui-lib';

(async () => {
  const app = await createApplication({
    providers: [provideHttpClient(withInterceptorsFromDi())],
  });
  const PaymentElement = createCustomElement(SSPaymentMakerComponent, {
    injector: app.injector,
  });
  customElements.define('ss-payment-flow', PaymentElement);
})();
`
);

// ── 3. Write angular.json ────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(BUILD_DIR, 'angular.json'),
  JSON.stringify({
    $schema: './node_modules/@angular/cli/lib/config/schema.json',
    version: 1,
    newProjectRoot: 'projects',
    projects: {
      'payment-element': {
        projectType: 'application',
        root: '',
        sourceRoot: 'src',
        architect: {
          build: {
            builder: '@angular-devkit/build-angular:application',
            options: {
              outputPath: 'dist',
              index: false,
              browser: 'src/main.ts',
              tsConfig: 'tsconfig.json',
              polyfills: ['zone.js'],
              outputHashing: 'none',
              optimization: true,
              sourceMap: false,
              namedChunks: false,
              budgets: [],
            },
          },
        },
      },
    },
  }, null, 2)
);

// ── 4. Write tsconfig.json ───────────────────────────────────────────────────
fs.writeFileSync(
  path.join(BUILD_DIR, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      outDir: './dist/out-tsc',
      strict: true,
      skipLibCheck: true,
      esModuleInterop: true,
      experimentalDecorators: true,
      moduleResolution: 'bundler',
      importHelpers: true,
      target: 'ES2022',
      module: 'ES2022',
      useDefineForClassFields: false,
      lib: ['ES2022', 'dom'],
    },
    angularCompilerOptions: {
      enableI18nLegacyMessageIdFormat: false,
      strictInjectionParameters: true,
      strictInputAccessModifiers: true,
      strictTemplates: true,
    },
  }, null, 2)
);

// ── 5. Symlink node_modules from root (avoids re-downloading all packages) ───
console.log('🔗 Linking node_modules from project root...');
const nmLink = path.join(BUILD_DIR, 'node_modules');
if (!fs.existsSync(nmLink)) {
  fs.symlinkSync(path.join(ROOT, 'node_modules'), nmLink, 'junction');
}

// ── 6. Run ng build ───────────────────────────────────────────────────────────
console.log('⚙️  Running ng build (this may take a minute)...');
const ngBin = path.join(ROOT, 'node_modules', '.bin', 'ng');
try {
  execSync(`"${ngBin}" build payment-element --configuration production`, {
    cwd: BUILD_DIR,
    stdio: 'inherit',
  });
} catch (err) {
  console.error('\n❌ ng build failed. See errors above.');
  process.exit(1);
}

// ── 7. Concatenate output chunks ──────────────────────────────────────────────
console.log('\n📦 Concatenating output chunks...');
const distDir = path.join(BUILD_DIR, 'dist', 'browser');
const chunkOrder = ['polyfills.js', 'main.js'];
let combined = '';

// Any extra vendor chunks first
const allJs = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
const extras = allJs.filter(f => !chunkOrder.includes(f));
for (const extra of extras) {
  const content = fs.readFileSync(path.join(distDir, extra), 'utf8');
  combined += content + '\n';
  console.log(`   + ${extra} (${(Buffer.byteLength(content) / 1024).toFixed(1)} KB)`);
}

// Then polyfills + main in order
for (const chunk of chunkOrder) {
  const p = path.join(distDir, chunk);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    combined += content + '\n';
    console.log(`   + ${chunk} (${(Buffer.byteLength(content) / 1024).toFixed(1)} KB)`);
  }
}

// ── 8. Write to public/ ───────────────────────────────────────────────────────
fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, combined, 'utf8');
const totalKB = (Buffer.byteLength(combined, 'utf8') / 1024).toFixed(1);
console.log(`\n✅ Bundle written → public/ss-payment-flow-element.js (${totalKB} KB)`);

// ── 9. Clean up ───────────────────────────────────────────────────────────────
fs.rmSync(BUILD_DIR, { recursive: true, force: true });
console.log('🧹 Cleaned up temp build directory');
console.log('\n🚀 Done! Run `npm run dev` and the bundle will be served at /ss-payment-flow-element.js\n');
