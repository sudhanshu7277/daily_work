import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, of, delay, Subscription } from 'rxjs';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

interface Threshold {
  min: number;
  max: number;
  checker1: string;
  checker2: string;
  checker3: string;
  maker: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  amountForm = new FormGroup({
    amount: new FormControl<number | null>(null)
  });

  private subscription!: Subscription;

  // Thresholds exactly as in the screenshot
  private thresholds: Threshold[] = [
    { min: 0,             max: 1,               checker1: 'Any', checker2: 'Not Required', checker3: 'Not Required', maker: 'RM30616' },
    { min: 1,             max: 15_000_000,      checker1: 'Any', checker2: 'Not Required', checker3: 'Not Required', maker: 'OneAT' },
    { min: 15_000_000,    max: 20_000_000,      checker1: 'Any', checker2: 'C11',          checker3: 'Not Required', maker: 'OneAT' },
    { min: 20_000_000,    max: 500_000_000,     checker1: 'Any', checker2: 'C12',          checker3: 'Not Required', maker: 'AK93171' },
    { min: 500_000_000,   max: 2_000_000_000,   checker1: 'Any', checker2: 'C12',          checker3: 'C13',          maker: 'AK93171' },
    { min: 2_000_000_000, max: 5_000_000_000,   checker1: 'Any', checker2: 'C12',          checker3: 'C13',          maker: 'AK93171' }
  ];

  private readonly MAX_AUTHORIZED = 5_000_000_000; // 5 billion

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.subscription = this.amountForm.get('amount')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => {
        if (value === null || value <= 0) {
          return of(null);
        }

        const amount = Number(value);

        // Simulate API call
        return of(amount).pipe(
          delay(800),
          switchMap(() => {
            if (amount > this.MAX_AUTHORIZED) {
              throw new Error('You are not authorized to approve this amount');
            }

            // Find the matching threshold rule
            const rule = this.thresholds.find(
              t => amount >= t.min && amount <= t.max
            );

            if (!rule) {
              throw new Error('No authorization rule found for this amount');
            }

            // Build success message with required approvers
            const message = `
              Approval successful for $${amount.toLocaleString()}<br><br>
              <strong>Required Approvers:</strong><br>
              • Checker 1: ${rule.checker1}<br>
              ${rule.checker2 !== 'Not Required' ? `• Checker 2: ${rule.checker2}<br>` : ''}
              ${rule.checker3 !== 'Not Required' ? `• Checker 3: ${rule.checker3}<br>` : ''}
              • Maker: ${rule.maker}
            `;

            return of({ message, html: true });
          }),
          // Handle authorization error
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          catchError(err => {
            this.openDialog(
              'Authorization Error',
              err.message || 'You are not authorized to approve this amount'
            );
            return of(null);
          })
        );
      })
    ).subscribe(response => {
      if (response) {
        this.openDialog('Approval Successful', response.message, response.html);
      }
    });
  }

  private openDialog(title: string, message: string, enableHtml: boolean = false): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message, enableHtml },
      width: '500px'
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}