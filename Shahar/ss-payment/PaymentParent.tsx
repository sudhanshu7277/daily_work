import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PaymentChild from './PaymentChild';
import {
  PaymentMode,
  DualBlindKeyFlag,
  PaymentComponentInput,
  PaymentComponentOutput,
  Pain001Model,
  FormFieldConfig,
  FormValidityPayload
} from '../types/models';
import {
  buildPain001ModelFromDetails,
  populatePaymentDetailsFromSource,
  formatDateForInput,
  parseCommaSeparated
} from '../utils/paymentUtils';
import * as hardcapService from '../services/hardcapService';
import { useAuth } from '@/context/AuthContext';
import './payment-flow.css';

const API_BASE = (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.REACT_APP_API_URL) || '';

async function postJson(url: string, payload: unknown): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error((body && (body.error || body.message)) || `Request failed (${res.status})`);
    err.error = body;
    throw err;
  }
  return body;
}

const PARENT_VERBIAGES: Record<string, string> = {
  DebtorInfo: 'Debtor Information',
  ValueDate: 'Value Date',
  ValueDateIsRequired: 'Value Date is required',
  DebtorName: 'Debtor Name',
  DebtorNameIsRequired: 'Debtor Name is required',
  DebtorAccountNumber: 'Debtor Account Number',
  DebtorAccountNumberIsRequired: 'Debtor Account Number is required',
  DebtorAgentBIC: 'Debtor Agent BIC',
  DebtorAgentBicIsRequired: 'Debtor Agent BIC is required',
  ChargeInformation: 'Charge Information',
  ChargesAmount: 'Charges Amount',
  ChargesAgentBic: 'Charges Agent BIC',
  DebtorAddress: 'Debtor Address',
  DebtorStreet: 'Debtor Street',
  DebtorBuildingNumber: 'Debtor Building Number',
  DebtorPostalCode: 'Debtor Postal Code',
  DebtorTownOrCityName: 'Debtor Town / City Name',
  DebtorState: 'Debtor State',
  DebtorCountry: 'Debtor Country',
  DebtorSortCode: 'Debtor Sort Code',
  TransactionDetails: 'Transaction Details',
  TransactionAmount: 'Transaction Amount',
  TransactionAmountIsRequired: 'Transaction Amount is required (min 0)',
  ValidatingHardcapLimit: 'Validating hardcap limit...',
  Currency: 'Currency',
  CurrencyIsRequired: 'Currency is required',
  PaymentType: 'Payment Type (CBT, BKT, DFT)',
  PaymentTypeIsRequired: 'Payment Type is required',
  RemittanceInformation: 'Remittance Information',
  CreditorInformation: 'Creditor Information',
  CreditorName: 'Creditor Name',
  CreditorNameIsRequired: 'Creditor Name is required',
  CreditorAccountNumber: 'Creditor Account Number',
  CreditorAccountNumberIsRequired: 'Creditor Account Number is required',
  CreditorAgentBIC: 'Creditor Agent BIC',
  Required: 'Required',
  CreditorAgentBankName: 'Creditor Agent Bank Name',
  creditorAgentPostalAddress: 'Creditor Agent Account Number',
  CreditorAddress: 'Creditor Address',
  CreditorStreet: 'Creditor Street',
  CreditorBuildingNumber: 'Creditor Building Number',
  CreditorPostalCode: 'Creditor Postal Code',
  CreditorTownOrCityName: 'Creditor Town / City Name',
  CreditorState: 'Creditor State',
  CreditorCountry: 'Creditor Country',
  CreditorSortCode: 'Creditor Sort Code',
  SecondIntermediaryBank: '2nd Intermediary Bank',
  SecondIntermediaryBankSWIFTCode: '2nd Intermediary Bank SWIFT Code',
  SecondIntermediaryBankRoutingCode: '2nd Intermediary Bank Routing Code',
  SecondIntermediaryBankName: '2nd Intermediary Bank Name',
  SecondIntermediaryBankCountryCode: '2nd Intermediary Bank Country Code',
  SecondIntermediaryAccountNumber: '2nd Intermediary Account Number',
  FirstIntermediaryBank: '1st Intermediary Bank',
  FirstIntermediaryBankSWIFTCode: '1st Intermediary Bank SWIFT Code',
  FirstIntermediaryBankRoutingCode: '1st Intermediary Bank Routing Code',
  FirstIntermediaryBankName: '1st Intermediary Bank Name',
  FirstIntermediaryBankCountryCode: '1st Intermediary Bank Country Code',
  FirstIntermediaryAccountNumber: '1st Intermediary Account Number',
  AdditionalDetails: 'Additional Details',
  ChargeDetails: 'Charge Details',
  PaymentInformation: 'Payment Information',
  DebtorAddressDetails: 'Debtor Address Details',
  IntermediaryBankDetails: 'Intermediary Bank Details',
  CreditorAddressDetails: 'Creditor Address Details',
  DebtorAddressLine1: 'Debtor Address Line 1',
  DebtorAddressLine2: 'Debtor Address Line 2',
  DebtorCountrySubDivisionLabel: 'Debtor Country Sub Division',
  CreditorAddressLine1: 'Creditor Address Line 1',
  CreditorAddressLine2: 'Creditor Address Line 2',
  CreditorCountrySubDivisionLabel: 'Creditor Country Sub Division',
  SubmitPayment: 'Submit Payment'
};

const PARENT_FIELD_CONFIG: FormFieldConfig[] = [
  {
    fieldName: 'painPaymentMethodType',
    label: 'Payment Type (CBT, BKT, DFT)',
    hidden: false,
    required: false,
    options: ['CBT', 'BKT', 'DFT'],
    placeholder: '-- Select --'
  },
  {
    fieldName: 'requestedExecutionDate',
    label: 'Value Date',
    hidden: false,
    required: true,
    type: 'date'
  },
  {
    fieldName: 'instructedAmountCurrencyCode',
    label: 'Currency',
    hidden: false,
    required: true
  },
  {
    fieldName: 'instructedAmount',
    label: 'Transaction Amount',
    hidden: false,
    required: true
  },
  {
    fieldName: 'debtorName',
    label: 'Debtor Name',
    hidden: false,
    required: true
  },
  {
    fieldName: 'debtorAccountNumber',
    label: 'Debtor Account Number',
    hidden: false,
    required: true
  },
  {
    fieldName: 'debtorAgentBIC',
    label: 'Debtor Agent BIC',
    hidden: false,
    required: true
  },
  {
    fieldName: 'debtorStreetName',
    label: 'Debtor Street',
    hidden: false,
    required: false
  },
  {
    fieldName: 'debtorBuildingNumber',
    label: 'Debtor Building Number',
    hidden: false,
    required: false
  },
  {
    fieldName: 'debtorPostalCode',
    label: 'Debtor Postal Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'debtorTownName',
    label: 'Debtor Town / City Name',
    hidden: false,
    required: false
  },
  {
    fieldName: 'debtorCountrySubDivision',
    label: 'Debtor State',
    hidden: false,
    required: false
  },
  {
    fieldName: 'debtorCountryCode',
    label: 'Debtor Country',
    hidden: false,
    required: false
  },
  {
    fieldName: 'debtorSortCodeUK',
    label: 'Debtor Sort Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'debtorSortCodeUS',
    label: 'Debtor Sort Code (US)',
    hidden: false,
    required: false
  },
  {
    fieldName: 'firstIntermediaryBankBIC',
    label: '1st Intermediary Bank SWIFT Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'firstIntermediaryBankRoutingCode',
    label: '1st Intermediary Bank Routing Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'firstIntermediaryBankName',
    label: '1st Intermediary Bank Name',
    hidden: false,
    required: false
  },
  {
    fieldName: 'firstIntermediaryBankCountryCode',
    label: '1st Intermediary Bank Country Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'firstIntermediaryBankAccountNumber',
    label: '1st Intermediary Account Number',
    hidden: false,
    required: false
  },
  {
    fieldName: 'secondIntermediaryBankBIC',
    label: '2nd Intermediary Bank SWIFT Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'secondIntermediaryBankRoutingCode',
    label: '2nd Intermediary Bank Routing Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'secondIntermediaryBankName',
    label: '2nd Intermediary Bank Name',
    hidden: false,
    required: false
  },
  {
    fieldName: 'secondIntermediaryBankCountryCode',
    label: '2nd Intermediary Bank Country Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'secondIntermediaryBankAccountNumber',
    label: '2nd Intermediary Account Number',
    hidden: false,
    required: false
  },
  {
    fieldName: 'creditorName',
    label: 'Creditor Name',
    hidden: false,
    required: true
  },
  {
    fieldName: 'creditorAccount',
    label: 'Creditor Account Number',
    hidden: false,
    required: true
  },
  {
    fieldName: 'creditorAgentFinancialInstitutionBIC',
    label: 'Creditor Agent BIC',
    hidden: false,
    required: true
  },
  {
    fieldName: 'creditorAgentFinancialInstitutionName',
    label: 'Creditor Agent Bank Name',
    hidden: false,
    required: true
  },
  {
    fieldName: 'creditorAddressLines1',
    label: 'Creditor Address Line 1',
    hidden: false,
    required: true
  },
  {
    fieldName: 'creditorStreetName',
    label: 'Creditor Street',
    hidden: false,
    required: false
  },
  {
    fieldName: 'creditorBuildingNumber',
    label: 'Creditor Building Number',
    hidden: false,
    required: false
  },
  {
    fieldName: 'creditorPostalCode',
    label: 'Creditor Postal Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'creditorTownName',
    label: 'Creditor Town / City Name',
    hidden: false,
    required: false
  },
  {
    fieldName: 'creditorCountrySubDivision',
    label: 'Creditor State',
    hidden: false,
    required: false
  },
  {
    fieldName: 'creditorCountryCode',
    label: 'Creditor Country',
    hidden: false,
    required: false
  },
  {
    fieldName: 'creditorSortCodeUK',
    label: 'Creditor Sort Code',
    hidden: false,
    required: false
  },
  {
    fieldName: 'creditorSortCodeUS',
    label: 'Creditor Sort Code (US)',
    hidden: false,
    required: false
  },
  {
    fieldName: 'ustrdPaymentDetails',
    label: 'Remittance Information',
    hidden: false,
    required: false
  },
  {
    fieldName: 'painPaymentMethodType',
    label: 'Payment Type (CBT, BKT, DFT)',
    hidden: false,
    required: false
  },
  {
    fieldName: 'chargeBearer',
    label: 'Charge Information',
    hidden: false,
    required: true
  },
  {
    fieldName: 'chargesAmount',
    label: 'Charges Amount',
    hidden: false,
    required: false
  },
  {
    fieldName: 'chargesAgentBIC',
    label: 'Charges Agent BIC',
    hidden: false,
    required: false
  }
];

function emptyPaymentDetailsRequest() {
  return {
    requestedExecutionDate: '',
    source: '',
    debtorName: '',
    debtorAccountNumber: '',
    debtorAgentBIC: '',
    chargeBearer: '',
    chargesAmount: 0,
    chargesAgentBIC: '',
    debtorStreetName: '',
    debtorBuildingNumber: '',
    debtorPostalCode: '',
    debtorTownName: '',
    debtorCountrySubDivision: '',
    debtorCountryCode: '',
    debtorSortCodeUK: '',
    debtorSortCodeUS: '',
    instructedAmount: '',
    instructedAmountCurrencyCode: '',
    creditorName: '',
    creditorAccount: '',
    creditorAgentFinancialInstitutionBIC: '',
    creditorAgentFinancialInstitutionName: '',
    creditorAgentPostalAddress: '',
    creditorStreetName: '',
    creditorBuildingNumber: '',
    creditorPostalCode: '',
    creditorTownName: '',
    creditorCountrySubDivision: '',
    creditorCountryCode: '',
    creditorSortCodeUK: '',
    creditorSortCodeUS: '',
    ustrdPaymentDetails: '',
    painPaymentMethodType: '',
    firstIntermediaryBankBIC: '',
    firstIntermediaryBankRoutingCode: '',
    firstIntermediaryBankName: '',
    firstIntermediaryBankCountryCode: '',
    firstIntermediaryBankAccountNumber: '',
    secondIntermediaryBankBIC: '',
    secondIntermediaryBankRoutingCode: '',
    secondIntermediaryBankName: '',
    secondIntermediaryBankCountryCode: '',
    secondIntermediaryBankAccountNumber: '',
    applicationName: 'ADR',
    applicationModule: 'ADR',
    region: ''
  };
}

export interface PaymentParentProps {
  currentUser?: { name?: string } | null;
  initialCheckerPayload?: any;
  initialRepairPayload?: any;
}

function ParentSectionPreview({
  modifiedHeading,
  checkerData,
  selectedMode,
  onValidityChange
}: Readonly<{
  modifiedHeading: string;
  checkerData: {
    securityId: string;
    eventRecordDate: string;
    eventType: string;
    issCode: string;
    eventValueDate: string;
  };
  selectedMode: PaymentMode;
  onValidityChange: (payload: { isValid: boolean; parentDetailsFormValues: Record<string, any> }) => void;
}>) {
  useEffect(() => {
    onValidityChange({ isValid: true, parentDetailsFormValues: checkerData as any });
  }, [checkerData, onValidityChange]);

  if (selectedMode === 'maker') {
    return modifiedHeading ? <div className="parent-section-heading">{modifiedHeading}</div> : null;
  }

  return (
    <div className="parent-section-checker-info">
      {modifiedHeading && <div className="parent-section-heading">{modifiedHeading}</div>}
      <div className="parent-section-meta">
        {checkerData.securityId && <span><strong>Security ID:</strong> {checkerData.securityId}</span>}
        {checkerData.eventType && <span><strong>Event type:</strong> {checkerData.eventType}</span>}
        {checkerData.issCode && <span><strong>ISS code:</strong> {checkerData.issCode}</span>}
        {checkerData.eventValueDate && <span><strong>Value date:</strong> {checkerData.eventValueDate}</span>}
      </div>
    </div>
  );
}

export default function PaymentParent({
  currentUser,
  initialCheckerPayload,
  initialRepairPayload
}: Readonly<PaymentParentProps>) {
  const authContext = useAuth();
  const soeId = typeof authContext === 'object' && authContext !== null
    ? ((authContext as any).soeId || (authContext as any).user?.soeId || (authContext as any).userId || '')
    : String(authContext || '');

  const [selectedMode, setSelectedMode] = useState<PaymentMode>('maker');
  const [dualBlindKeyFlag, setDualBlindKeyFlag] = useState<DualBlindKeyFlag>('N');
  const [currency] = useState<string>('USD');
  const [comments, setComments] = useState<string>('');
  const [isDualBlindKeyPassed, setIsDualBlindKeyPassed] = useState<boolean>(false);
  const [hardcapBaseUrl] = useState<string>('/shared-services/api/payment');
  const [hideFieldsInput] = useState<string>('');
  const [dualBlindKeyFieldsInput] = useState<string>(
    'instructedAmount,creditorName,debtorName,debtorAccountNumber,debtorAgentBIC,instructedAmountCurrencyCode' +
    ',creditorAccount,creditorAgentFinancialInstitutionBIC,creditorAgentFinancialInstitutionName,creditorAgentPostalAddress'
  );
  const [rejectedFieldsInput, setRejectedFieldsInput] = useState<string>('');

  const [pacsFormVerbiages, setPacsFormVerbiages] = useState<Record<string, string>>(PARENT_VERBIAGES);
  const [displaySuccessOrFailureMessage, setDisplaysSuccessOrFailureMessage] = useState<any>({
    referenceId: '',
    status: '',
    message: null,
    createdAt: null,
    color: ''
  });

  const [hardcapResultReceived, setHardcapResultReceived] = useState<any>(undefined);
  const [enableSubmitButton, setEnableSubmitButton] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parentDetailsFormValues, setParentDetailsFormValues] = useState<Record<string, any>>({});
  const [, setIsFormValid] = useState<boolean>(false);

  const paymentDetailsRequestRef = useRef(emptyPaymentDetailsRequest());
  const [, forceRender] = useState(0);
  const bumpPaymentDetailsRequest = () => forceRender(n => n + 1);

  const [currentPaymentModel, setCurrentPaymentModel] = useState<Pain001Model | null>(null);
  const [modifiedHeading] = useState<string>('');
  const [checkerData, setCheckerData] = useState<any>({ eventRecordDate: '', issCode: '', eventType: '', securityId: '' });
  const captureAuthorizationResponseRef = useRef<any>(null);

  const isMakerMode = 'maker';

  const [, setHardcapAmountObjectReceivedFromChild] = useState({
    instructedAmount: '',
    instructedAmountCurrencyCode: ''
  });

  const paymentInput: PaymentComponentInput = useMemo(() => ({
    applicationName: 'ADR',
    applicationModule: 'ADR',
    hideFieldsList: parseCommaSeparated(hideFieldsInput),
    currency,
    dualBlindKeyFields: parseCommaSeparated(dualBlindKeyFieldsInput),
    dualBlindKeyFlag,
    paymentModel: currentPaymentModel,
    rejectedFieldList: parseCommaSeparated(rejectedFieldsInput),
    paymentMode: selectedMode,
    hardcapLimitCheckBaseUrl: hardcapBaseUrl
  }), [hideFieldsInput, currency, dualBlindKeyFieldsInput, dualBlindKeyFlag, currentPaymentModel, rejectedFieldsInput, selectedMode, hardcapBaseUrl]);

  const checkerDataFromParent = useMemo(() => ({
    securityId: checkerData.securityId || '',
    eventRecordDate: formatDateForInput(checkerData.eventRecordDate) || '',
    eventType: checkerData.eventType || '',
    issCode: checkerData.issCode || '',
    eventValueDate: formatDateForInput(checkerData.eventValueDate || checkerData.requestedExecutionDate) || ''
  }), [checkerData]);

  const loadSamplePain001 = useCallback((loadCheckerValues: any) => {
    setCurrentPaymentModel(buildPain001ModelFromDetails(loadCheckerValues));
  }, []);

  const loadRepairSample = useCallback((loadCheckerSample: any) => {
    loadSamplePain001(loadCheckerSample);
    setSelectedMode('repair');
    setRejectedFieldsInput('debtorName,creditorName,instructedAmount');
  }, [loadSamplePain001]);

  const setCheckerDataForParent = useCallback((message: any) => {
    setCheckerData((prev: any) => ({
      ...prev,
      securityId: message.securityId,
      eventRecordDate: message.eventRecordDate,
      eventType: message.eventType,
      issCode: message.issCode,
      requestedExecutionDate: message.paymentDetailsRequest?.requestedExecutionDate || ''
    }));
  }, []);

  const loadCheckerSample = useCallback((loadCheckerValues: any) => {
    loadSamplePain001(loadCheckerValues);
    setSelectedMode('checker');
  }, [loadSamplePain001]);

  const populatePaymentDetailsFromChecker = useCallback((checkerPaymentDetails: any) => {
    if (!checkerPaymentDetails) return;
    populatePaymentDetailsFromSource(paymentDetailsRequestRef.current, checkerPaymentDetails);
    bumpPaymentDetailsRequest();
  }, []);

  useEffect(() => {
    if (initialCheckerPayload && initialCheckerPayload.txnId) {
      captureAuthorizationResponseRef.current = initialCheckerPayload;
      setDualBlindKeyFlag(initialCheckerPayload.paymentTransactionWorkflow?.isDualBlindKeyChecker1 ?? 'N');
      setCheckerDataForParent(initialCheckerPayload);
      loadCheckerSample(initialCheckerPayload.paymentDetailsRequest);
      populatePaymentDetailsFromChecker(initialCheckerPayload.paymentDetailsRequest);
    }
  }, [initialCheckerPayload, setCheckerDataForParent, loadCheckerSample, populatePaymentDetailsFromChecker]);

  useEffect(() => {
    if (initialRepairPayload) {
      loadRepairSample(initialRepairPayload);
    }
  }, [initialRepairPayload, loadRepairSample]);

  const payloadPreperation = useCallback((paymentData: Pain001Model) => {
    const req: any = paymentDetailsRequestRef.current;
    req.requestedExecutionDate = paymentData.requestedExecutionDate;
    req.source = '';
    req.debtorName = paymentData.debtorName;
    req.debtorAccountNumber = paymentData.debtorAccountNumber;
    req.debtorAgentBIC = paymentData.debtorAgentBIC;
    req.chargeBearer = paymentData.chargeBearer;
    req.chargesAmount = paymentData.chargesAmount;
    req.chargesAgentBIC = paymentData.chargesAgentBIC;
    req.debtorStreetName = paymentData.debtorStreetName;
    req.debtorBuildingNumber = paymentData.debtorBuildingNumber;
    req.debtorPostalCode = paymentData.debtorPostalCode;
    req.debtorTownName = paymentData.debtorTownName;
    req.debtorCountrySubDivision = paymentData.debtorCountrySubDivision;
    req.debtorCountryCode = paymentData.debtorCountryCode;
    req.debtorSortCodeUK = paymentData.debtorSortCodeUK;
    req.debtorSortCodeUS = paymentData.debtorSortCodeUS;
    req.instructedAmount = paymentData.instructedAmount;
    req.instructedAmountCurrencyCode = paymentData.instructedAmountCurrencyCode;
    req.creditorName = paymentData.creditorName;
    req.creditorAccount = paymentData.creditorAccount;
    req.creditorAgentFinancialInstitutionBIC = paymentData.creditorAgentFinancialInstitutionBIC;
    req.creditorAgentFinancialInstitutionName = paymentData.creditorAgentFinancialInstitutionName;
    req.creditorAgentPostalAddress = paymentData.creditorAgentPostalAddress;
    req.creditorStreetName = paymentData.creditorStreetName;
    req.creditorBuildingNumber = paymentData.creditorBuildingNumber;
    req.creditorPostalCode = paymentData.creditorPostalCode;
    req.creditorTownName = paymentData.creditorTownName;
    req.creditorCountrySubDivision = paymentData.creditorCountrySubDivision;
    req.creditorCountryCode = paymentData.creditorCountryCode;
    req.creditorSortCodeUK = paymentData.creditorSortCodeUK;
    req.creditorSortCodeUS = paymentData.creditorSortCodeUS;
    req.ustrdPaymentDetails = paymentData.ustrdPaymentDetails;
    req.painPaymentMethodType = paymentData.painPaymentMethodType;
    req.firstIntermediaryBankBIC = paymentData.firstIntermediaryBankBIC;
    req.firstIntermediaryBankRoutingCode = paymentData.firstIntermediaryBankRoutingCode;
    req.firstIntermediaryBankName = paymentData.firstIntermediaryBankName;
    req.firstIntermediaryBankCountryCode = paymentData.firstIntermediaryBankCountryCode;
    req.firstIntermediaryBankAccountNumber = paymentData.firstIntermediaryBankAccountNumber;
    req.secondIntermediaryBankBIC = paymentData.secondIntermediaryBankBIC;
    req.secondIntermediaryBankRoutingCode = paymentData.secondIntermediaryBankRoutingCode;
    req.secondIntermediaryBankName = paymentData.secondIntermediaryBankName;
    req.secondIntermediaryBankCountryCode = paymentData.secondIntermediaryBankCountryCode;
    req.secondIntermediaryBankAccountNumber = paymentData.secondIntermediaryBankAccountNumber;
    req.applicationName = paymentData.applicationName ? paymentData.applicationName : 'ADR';
    req.applicationModule = paymentData.applicationModule ? paymentData.applicationModule : 'ADR';
    req.region = paymentData.region;
    bumpPaymentDetailsRequest();
  }, []);

  const onPaymentOutput = useCallback((output: PaymentComponentOutput) => {
    payloadPreperation(output.paymentData);
    setEnableSubmitButton(output.isValid);
    setIsDualBlindKeyPassed(output.isDualBlindKeyPassed);
    if (!output.isValid) {
      console.log('Submit button disabled - payment form is not valid. Output message:', output.outputMessage || 'mandatory fields missing');
    }
  }, [payloadPreperation]);

  const onFormValidityChange = useCallback((validFormPayload: FormValidityPayload) => {
    console.log('maker form validity and payload received in parent component: ', validFormPayload);
    setIsFormValid(validFormPayload.validForm);
    setParentDetailsFormValues(validFormPayload.makerPayload);
  }, []);

  const onParentFormValidityChange = useCallback((isValidAndParentFormData: {
    isValid: boolean;
    parentDetailsFormValues: Record<string, any>;
  }) => {
    setParentDetailsFormValues(isValidAndParentFormData.parentDetailsFormValues);
  }, []);

  const validateHardcap = useCallback(async (hardCapPayloadFromMakerChild: {
    instructedAmountCurrencyCode?: string;
    instructedAmount?: string | number;
  }) => {
    if (isMakerMode !== 'maker') return;
    const raw = hardCapPayloadFromMakerChild?.instructedAmount;
    const numericAmount = typeof raw === 'string' ? parseFloat(raw) : (raw as number);

    if (numericAmount === null || numericAmount === undefined || isNaN(numericAmount) || numericAmount < 0) {
      setHardcapResultReceived(undefined);
      return;
    }

    try {
      const response = await hardcapService.verifyHardCap(hardcapBaseUrl, {
        currency: hardCapPayloadFromMakerChild?.instructedAmountCurrencyCode || 'USD',
        paymentAmount: numericAmount,
        applicationName: paymentInput.applicationName,
        applicationModule: paymentInput.applicationModule
      });

      if (response.amountWithinLimit) {
        setHardcapResultReceived('Hardcap limit check passed');
      } else {
        setHardcapResultReceived('Value cannot be more than ' + response.hardCapValue);
      }
    } catch {
      setHardcapResultReceived('Unable to validate hardcap limit');
    }
  }, [isMakerMode, hardcapBaseUrl, paymentInput.applicationName, paymentInput.applicationModule]);

  const onAmountChange = useCallback((hardCapPayloadFromMakerChild: {
    instructedAmountCurrencyCode: string;
    instructedAmount: any;
  }) => {
    setHardcapAmountObjectReceivedFromChild(hardCapPayloadFromMakerChild);
    if (hardCapPayloadFromMakerChild.instructedAmount) {
      validateHardcap(hardCapPayloadFromMakerChild);
    }
  }, [validateHardcap]);

  const onApprove = useCallback(async (status: string) => {
    setIsProcessing(true);
    console.log('Approved');
    setIsProcessing(false);

    const auth = captureAuthorizationResponseRef.current || {};
    const url = `${API_BASE}/api/payments/checker/approve`;
    const payload = {
      application: auth.applicationName ? paymentDetailsRequestRef.current.applicationName : 'ADR',
      module: auth.applicationModule ? paymentDetailsRequestRef.current.applicationModule : 'ADR',
      action: status,
      comments,
      loginUser: currentUser?.name?.toUpperCase() || '',
      transactionId: auth.transactionId ?? '',
      paymentDetailsRequest: paymentDetailsRequestRef.current
    };

    try {
      const response = await postJson(url, payload);
      if (response && response.status === 'APPROVED') {
        setDisplaysSuccessOrFailureMessage((prev: any) => ({
          ...prev,
          message: 'Approval processed successfully !',
          color: 'green',
          success: response.status
        }));
      }
      setTimeout(() => setDisplaysSuccessOrFailureMessage((prev: any) => ({ ...prev, message: '' })), 4000);
    } catch (err: any) {
      console.log('Error response : ', err);
      if (err?.error?.error) {
        console.log('Error: ', err.error.error);
        setDisplaysSuccessOrFailureMessage((prev: any) => ({
          ...prev,
          message: err.error.error || 'Approval processing failed !',
          color: 'red'
        }));
        setTimeout(() => setDisplaysSuccessOrFailureMessage((prev: any) => ({ ...prev, message: '' })), 4000);
      }
    }
  }, [comments, currentUser]);

  const onReject = useCallback((status: string) => {
    setIsProcessing(true);
    console.log('Rejected');
    onApprove(status);
    setIsProcessing(false);
  }, [onApprove]);

  const submitPaymentToBackend = useCallback(async () => {
    setPacsFormVerbiages(prev => ({ ...prev, SubmitPayment: 'Submitting..' }));
    const currentUserName = soeId ?? '';
    console.log('checking the value of current user : ', currentUserName);
    setEnableSubmitButton(false);

    try {
      setDisplaysSuccessOrFailureMessage((prev: any) => ({ ...prev }));
      setTimeout(() => {
        setDisplaysSuccessOrFailureMessage((prev: any) => ({ ...prev, message: '' }));
        setPacsFormVerbiages(prev => ({ ...prev, SubmitPayment: 'Submitted' }));
        setEnableSubmitButton(true);
      }, 3000);
    } catch (err: any) {
      setDisplaysSuccessOrFailureMessage((prev: any) => ({
        ...prev,
        message: 'Unable to Save, error response received.',
        color: 'red',
        status: 'Payment creation failed !'
      }));
      setTimeout(() => {
        setDisplaysSuccessOrFailureMessage((prev: any) => ({ ...prev, message: '' }));
        setPacsFormVerbiages(prev => ({ ...prev, SubmitPayment: 'Submit Payment' }));
        setEnableSubmitButton(true);
      }, 3000);
      console.log('Error response: ', err);
    }
  }, [soeId]);

  const closeModelPopUp = useCallback(() => {
    setDisplaysSuccessOrFailureMessage('' as any);
  }, []);

  return (
    <div className="sample-container">
      <div className="ppa-entry-parent-content">
        <ParentSectionPreview
          modifiedHeading={modifiedHeading}
          checkerData={checkerDataFromParent}
          selectedMode={selectedMode}
          onValidityChange={onParentFormValidityChange}
        />
      </div>

      <div className="payment-component-wrapper">
        <PaymentChild
          paymentInput={paymentInput}
          fieldConfig={PARENT_FIELD_CONFIG}
          pacsFormVerbiages={pacsFormVerbiages}
          loggedInUser={soeId}
          isMakerMode={selectedMode === 'maker'}
          isCheckerMode={selectedMode === 'checker'}
          isRepairMode={selectedMode === 'repair'}
          hardcapResultReceived={hardcapResultReceived}
          onAmountChange={onAmountChange}
          onFormValidityChange={onFormValidityChange}
          onPaymentOutput={onPaymentOutput}
        />
      </div>

      {(selectedMode === 'maker' || selectedMode === 'repair') && (
        <div className="action-bar">
          <button
            type="button"
            className={!enableSubmitButton ? 'lmn-btn-unclickable lmn-btn-grey' : 'lmn-btn lmn-btn-primary'}
            onClick={submitPaymentToBackend}
            disabled={!enableSubmitButton}
          >
            {selectedMode === 'repair' ? 'Resubmit Payment' : pacsFormVerbiages.SubmitPayment}
          </button>
        </div>
      )}

      {selectedMode === 'checker' && (
        <div className="action-container">
          <div className="form-group">
            <label htmlFor="checkerComments">Comments (Optional)</label>
            <textarea
              id="checkerComments"
              name="checkerComments"
              className="lmn-form-control"
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={3}
              placeholder="Enter any additional comments"
            />
          </div>
          <button
            type="button"
            className="btn-reject"
            onClick={() => onReject('Rejected')}
            disabled={isProcessing}
          >
            Reject
          </button>
          <button
            type="button"
            className="btn-approve"
            onClick={() => onApprove('Approved')}
            disabled={isProcessing || (!isDualBlindKeyPassed && dualBlindKeyFlag === 'Y')}
          >
            Approve
          </button>
        </div>
      )}

      {typeof displaySuccessOrFailureMessage === 'object' && displaySuccessOrFailureMessage?.message && (
        <div id="myModal" className="modal">
          <div className="modal-backdrop">
            <div className="modal-container">
              <header className="modal-header">
                <h1>
                  {displaySuccessOrFailureMessage.message === 'Payment record saved successfully !'
                    ? 'MAKER RECORD SAVED'
                    : 'MAKER RECORD NOT CREATED'}
                </h1>
                <button
                  type="button"
                  className="close-btn"
                  aria-label="Close"
                  onClick={closeModelPopUp}
                >
                  &times;
                </button>
              </header>
              <div className="modal-body">
                <div className="details-card">
                  <div className="detail-row">
                    <span className="label">Sender Reference ID:</span>
                    <span className="value">{displaySuccessOrFailureMessage.referenceId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">To be received from API</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Submitted:</span>
                    <span className="value">To be received from API</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className="value status-pending">
                      {displaySuccessOrFailureMessage.status}
                    </span>
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={closeModelPopUp}
                >
                  OK
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}