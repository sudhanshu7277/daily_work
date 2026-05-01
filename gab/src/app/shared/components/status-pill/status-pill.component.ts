import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { INSTRUCTION_STATUS_LABELS, InstructionStatus } from '@core/models';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'primary';

@Component({
  selector: 'gab-status-pill',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="gab-pill" [attr.data-tone]="tone()">
      {{ label() }}
    </span>
  `,
  styleUrls: ['./status-pill.component.scss'],
})
export class StatusPillComponent {
  private readonly _status = signal<InstructionStatus | null>(null);
  private readonly _override = signal<{ label?: string; tone?: Tone }>({});

  @Input() set status(value: InstructionStatus | null | undefined) {
    this._status.set(value ?? null);
  }
  @Input() set label(value: string | undefined) {
    this._override.update((o) => ({ ...o, label: value }));
  }
  @Input() set tone(value: Tone | undefined) {
    this._override.update((o) => ({ ...o, tone: value }));
  }

  protected readonly label = computed(
    () => this._override().label ?? (this._status() ? INSTRUCTION_STATUS_LABELS[this._status()!] : '—')
  );

  protected readonly tone = computed<Tone>(() => {
    if (this._override().tone) return this._override().tone!;
    return this.statusToTone(this._status());
  });

  private statusToTone(status: InstructionStatus | null): Tone {
    switch (status) {
      case 'draft': return 'neutral';
      case 'admin-maker':
      case 'admin-checker':
      case 'signature-validation':
      case 'operations-callback':
        return 'info';
      case 'payment-pending':
      case 'payment-in-progress':
        return 'warning';
      case 'payment-completed':
        return 'success';
      case 'cancelled':
        return 'neutral';
      case 'rejected':
        return 'danger';
      default: return 'neutral';
    }
  }
}
