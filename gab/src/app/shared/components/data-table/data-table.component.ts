import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DataTableColumn<T = unknown> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  cellTemplate?: TemplateRef<{ $implicit: T; row: T; column: DataTableColumn<T> }>;
  accessor?: (row: T) => unknown;
}

@Component({
  selector: 'gab-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gab-table-wrap">
      <table class="gab-table" [class.gab-table--striped]="striped" [class.gab-table--hover]="hover">
        <thead>
          <tr>
            @for (col of columns; track col.key) {
              <th
                class="gab-table__th"
                [style.width]="col.width || null"
                [style.text-align]="col.align || 'left'"
                [class.gab-table__th--sortable]="col.sortable"
                (click)="onSort(col)"
              >
                <span class="gab-table__th-inner">
                  {{ col.header }}
                  @if (col.sortable && sortBy === col.key) {
                    <span class="gab-table__sort" aria-hidden="true">
                      {{ sortDir === 'asc' ? '▲' : '▼' }}
                    </span>
                  }
                </span>
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @if (rows && rows.length > 0) {
            @for (row of rows; track trackBy(row); let i = $index) {
              <tr
                class="gab-table__tr"
                [class.gab-table__tr--clickable]="rowClickable"
                (click)="onRowClick(row)"
              >
                @for (col of columns; track col.key) {
                  <td
                    class="gab-table__td"
                    [style.text-align]="col.align || 'left'"
                  >
                    @if (col.cellTemplate) {
                      <ng-container
                        [ngTemplateOutlet]="col.cellTemplate"
                        [ngTemplateOutletContext]="{ $implicit: row, row: row, column: col }"
                      />
                    } @else {
                      {{ getValue(row, col) }}
                    }
                  </td>
                }
              </tr>
            }
          } @else {
            <tr>
              <td class="gab-table__empty" [attr.colspan]="columns.length">
                {{ emptyMessage }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent<T = unknown> {
  @Input() columns: DataTableColumn<T>[] = [];
  @Input() rows: T[] | null = [];
  @Input() emptyMessage = 'No data available';
  @Input() striped = false;
  @Input() hover = true;
  @Input() rowClickable = false;
  @Input() sortBy?: string;
  @Input() sortDir: 'asc' | 'desc' = 'asc';
  @Input() trackBy: (row: T) => unknown = (row) => row;

  @Output() readonly sortChange = new EventEmitter<{ sortBy: string; sortDir: 'asc' | 'desc' }>();
  @Output() readonly rowClick = new EventEmitter<T>();

  protected getValue(row: T, col: DataTableColumn<T>): unknown {
    if (col.accessor) return col.accessor(row);
    return (row as unknown as Record<string, unknown>)[col.key];
  }

  protected onSort(col: DataTableColumn<T>): void {
    if (!col.sortable) return;
    const dir: 'asc' | 'desc' =
      this.sortBy === col.key && this.sortDir === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ sortBy: col.key, sortDir: dir });
  }

  protected onRowClick(row: T): void {
    if (!this.rowClickable) return;
    this.rowClick.emit(row);
  }
}
