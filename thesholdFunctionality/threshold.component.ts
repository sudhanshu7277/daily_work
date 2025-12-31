import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, of, delay, Subscription, catchError } from 'rxjs';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

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

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.subscription = this.amountForm.get('amount')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => {
        if (value === null || value === 0) {
          return of(null);
        }

        const amount = Number(value);
        const payload = { amount };

        // Simulate POST API call with delay
        return of(payload).pipe(
          delay(800), // simulate network delay
          switchMap(() => {
            if (amount > 10000000000) { // > 10 billion
              throw new Error('You are not authorized to approve this amount');
            }
            return of({ message: `Approval successful for $${amount.toLocaleString()}` });
          }),
          catchError(err => {
            this.openDialog('Authorization Error', err.message || 'You are not authorized to approve this amount');
            return of(null); // swallow error after showing modal
          })
        );
      })
    ).subscribe(response => {
      if (response) {
        this.openDialog('Success', response.message);
      }
    });
  }

  private openDialog(title: string, message: string): void {
    this.dialog.open(MessageDialogComponent, {
      data: { title, message },
      width: '400px'
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}