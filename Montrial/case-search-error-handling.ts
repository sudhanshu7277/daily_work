export const getCaseError = createSelector(
    getCurrentCase,
    (state: CaseState) => state?.error
  );


  import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as CaseSelectors from '../../store/case/case.selectors'; // Adjust path as needed

@Component({
  selector: 'app-customer-search-result',
  templateUrl: './customer-search-result.component.html'
})
export class CustomerSearchResultComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Subscribe to the error selector stream
    this.subscription.add(
      this.store.select(CaseSelectors.getCaseError)
        .pipe(
          // Only log when an actual error message object/string is emitted
          filter(error => !!error) 
        )
        .subscribe((errorPayload: any) => {
          // 🟢 Logs the backend error object/text to your console
          console.log('Backend Error Response captured from NgRx State:', errorPayload);
          
          // If the backend error is wrapped inside an HTTP error response object:
          if (errorPayload?.error) {
            console.log('Extracted Error Message:', errorPayload.error);
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}


// error handling


this.subscriptions.add(
    this.actionsSubject
      .pipe(
        ofType(
          CustomerSearchActions.getResultFail,
          CustomerSearchActions.getNextResultsFailure
        )
      )
      .subscribe((action: any) => {
        this.showError = true;

        // 🟢 Extract and log the actual error message payload sent by the backend
        if (action && action.error) {
          console.log('Search API Failure payload caught in component:', action.error);
          
          // If the error message is a nested string inside an HTTP response object:
          const errorMsg = action.error.message || action.error.error || action.error;
          console.log('Extracted Error Message:', errorMsg);
        }
      })
  );