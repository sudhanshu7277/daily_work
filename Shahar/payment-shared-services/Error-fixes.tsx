// Change 1: Replace hasValidBktBicCountries with getPaymentTypeBicError (Lines 410–419)Replace 
// lines 410–419 with a pure helper that checks the exact rules from Jira IS-86442 and returns 
// the exact Jira error message (or '' when valid):   


export const BKT_BIC_MISMATCH_MESSAGE =
  'For BKT payments, Debtor Agent BIC and Creditor Agent BIC must be the same.';
export const DFT_BIC_COUNTRY_MESSAGE =
  'For DFT payments, Debtor Agent BIC and Creditor Agent BIC must belong to the same country.';
export const CBT_BIC_COUNTRY_MESSAGE =
  'For CBT payments, Debtor Agent BIC and Creditor Agent BIC must belong to different countries.';

/** Validates BKT, DFT, and CBT BIC rules and returns the Jira error message when violated. */
export const getPaymentTypeBicError = (pData: any): string => {
  const paymentMethodType = String(
    pData?.painPaymentMethodType || pData?.paymentType || ''
  )
    .trim()
    .toUpperCase();

  const debtorBic = String(pData?.debtorAgentBIC || '')
    .trim()
    .toUpperCase();
  const creditorBic = String(
    pData?.creditorAgentFinancialInstitutionBIC || pData?.creditorAgentBIC || ''
  )
    .trim()
    .toUpperCase();

  if (!debtorBic || !creditorBic) return '';

  if (paymentMethodType === 'BKT') {
    return debtorBic === creditorBic ? '' : BKT_BIC_MISMATCH_MESSAGE;
  }

  const dCountry = bicCountry(debtorBic);
  const cCountry = bicCountry(creditorBic);
  if (!dCountry || !cCountry) return '';

  if (paymentMethodType === 'DFT') {
    return dCountry === cCountry ? '' : DFT_BIC_COUNTRY_MESSAGE;
  }

  if (paymentMethodType === 'CBT') {
    return dCountry !== cCountry ? '' : CBT_BIC_COUNTRY_MESSAGE;
  }

  return '';
};


///Change 2: Add bicValidationError State Inside PaymentParent (Around Line 480, near isCurrentFormValid)
//Add one state variable alongside your existing form validity states:

const [bicValidationError, setBicValidationError] = useState<string>('');


//Change 3: Enforce & Set bicValidationError Inside handlePaymentOutput 
// (Lines 885–942)Update handlePaymentOutput (lines 885–942) so:   
// Line 889's duplicate setIsCurrentFormValid call is removed.   
// bicError = getPaymentTypeBicError(pData) is computed once and enforced in Maker, Checker, and Repair modes.  

const handlePaymentOutput = useCallback(
  (output: PaymentComponentOutput) => {
    const newValid = Boolean(output?.isValid);
    const newDualBlind = Boolean(output?.isDualBlindKeyPassed);
    const pData: any = output?.paymentData;
    if (!pData) {
      setBicValidationError('');
      setIsCurrentFormValid(false);
      return;
    }

    const bicError = getPaymentTypeBicError(pData);
    const isBicRuleValid = bicError === '';
    setBicValidationError((prev) => (prev !== bicError ? bicError : prev));

    const rawAmountStr = String(pData.instructedAmount ?? '').trim();
    const numericAmount = Number(rawAmountStr);
    const isPositiveAmount =
      rawAmountStr !== '' && Number.isFinite(numericAmount) && numericAmount > 0;
    const effectiveValid = newValid && isPositiveAmount && isBicRuleValid;
    setIsCurrentFormValid((prev) => (prev !== effectiveValid ? effectiveValid : prev));

    if (activeTab === 'checker') {
      const rawInitial = (initialData as any) || {};
      const pdr = rawInitial.paymentDetailsRequest || {};
      const act = rawInitial.actionDetails || {};

      const failed: string[] = [];
      const rekeyFieldsToCheck = DUAL_BLIND_REKEY_FIELDS;
      rekeyFieldsToCheck.forEach((field) => {
        const makerRaw = resolveMakerValue(field, rawInitial, pdr, act);
        const checkerRaw = resolveCheckerValue(field, pData, makerRaw);
        if (isRekeyMismatch(field, normalizeValue(makerRaw), normalizeValue(checkerRaw))) {
          failed.push(field);
        }
      });

      const isManualPassed = failed.length === 0;
      const isPassed = isManualPassed && Boolean(newDualBlind) && isBicRuleValid;
      setCheckerDualBlindPassed(isPassed);
      setIsCurrentFormValid(Boolean(output?.isValid) && isBicRuleValid && isPositiveAmount);
      currentFormPayload.current = {
        ...(currentFormPayload.current || {}),
        paymentDetailsRequest: pData,
      };

      console.log('[DualBlind Rekey Check]', {
        failedCount: failed.length,
        failedFields: failed,
        isPassed: failed.length === 0,
      });
      return;
    } else {
      setCheckerDualBlindPassed(newDualBlind);
    }

    const selectedPaymentMethodType = resolvePaymentMethodType(
      pData.painPaymentMethodType,
      pData.paymentType
    );
    if (!selectedPaymentMethodType) setIsCurrentFormValid(false);


    //Change 4: Display bicValidationError Above the Action Buttons in JSX 
    // (Line 1379)Right after </div> closing .payment-component-wrapper on line 1379
    //  (and right above {activeTab === 'maker' && ( on line 1381), render the error 
    // banner whenever bicValidationError is non-empty so it is visible in Maker, Checker, and Repair modes:   


    </div>

      {bicValidationError && (
        <div
          role="alert"
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '4px',
            border: '1px solid #d64545',
            background: '#fff2f0',
            color: '#d64545',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {bicValidationError}
        </div>
      )}

      {activeTab === 'maker' && (


/////////// BIC ERROR BANNER FIXES
//To move that existing bicValidationError inline beneath the BIC fields without adding any 
// createPortal, extra useState, or extra useEffect, you can just inject/clear a tiny 
// <div class="gab-bic-error"> directly inside the existing handlePaymentOutput where 
// bicError is already calculated—zero new hooks, zero portals, ~12 lines total:

//Shorten the 3 Messages (Lines 410–414)

export const BKT_BIC_MISMATCH_MESSAGE = 'Debtor & Creditor BIC must match for BKT.';
export const DFT_BIC_COUNTRY_MESSAGE = 'Debtor & Creditor BIC countries must match for DFT.';
export const CBT_BIC_COUNTRY_MESSAGE = 'Debtor & Creditor BIC countries must differ for CBT.';


//2. Render the Inline Message Inside handlePaymentOutput (Right After setBicValidationError(...))
//Add this small helper call right where bicError is already computed, and delete the bottom 
// {bicValidationError && ...} banner at line 1380:


const wrapper = paymentWrapperRef.current;
      if (wrapper) {
        wrapper.querySelectorAll('.gab-bic-inline-err').forEach((el) => el.remove());
        if (bicError) {
          ['debtorAgentBIC', 'creditorAgentFinancialInstitutionBIC'].forEach((name) => {
            const parent = wrapper.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.parentElement;
            if (parent) {
              const div = document.createElement('div');
              div.className = 'gab-bic-inline-err';
              div.style.cssText = 'color:#d64545;font-size:11px;margin-top:4px;';
              div.textContent = bicError;
              parent.appendChild(div);
            }
          });
        }
      }





      ///  That const wrapper = paymentWrapperRef.current; block 
      // (lines 173–186 in your first image) goes inside handlePaymentOutput 
      // (around line 930–940 of PaymentParent.tsx) right after setBicValidationError(...)—not
      //  down at line 1374 inside handleRepairResubmit.   Here is the exact spot in handlePaymentOutput 
      // (search for const bicError = getPaymentTypeBicError(pData); in PaymentParent.tsx):


      const bicError = getPaymentTypeBicError(pData);
      const isBicRuleValid = bicError === '';
      setBicValidationError((prev) => (prev !== bicError ? bicError : prev));

      const wrapper = paymentWrapperRef.current;
      if (wrapper) {
        wrapper.querySelectorAll('.gab-bic-inline-err').forEach((el) => el.remove());
        if (bicError) {
          ['debtorAgentBIC', 'creditorAgentFinancialInstitutionBIC'].forEach((name) => {
            const parent = wrapper.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.parentElement;
            if (parent) {
              const div = document.createElement('div');
              div.className = 'gab-bic-inline-err';
              div.style.cssText = 'color:#d64545;font-size:11px;margin-top:4px;';
              div.textContent = bicError;
              parent.appendChild(div);
            }
          });
        }
      }


      //And down in the JSX (around line 1425, right after </SSPaymentFlow>'s closing </div> 
      // and right above {activeTab === 'maker' && (), simply remove the {bicValidationError && ( ... )} 
      // banner block if you added it there so only the inline messages under the BIC inputs appear.







