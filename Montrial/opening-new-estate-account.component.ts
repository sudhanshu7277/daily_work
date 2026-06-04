export enum OpeningNewEstateAccountQuestionKeys {
    WILL_NEW_ESTATE_ACCOUNT_BE_OPENED = 'willNewEstateAccountBeOpened',
    AT_LEAST_ONE_EXECUTOR = 'atLeastOneExecutorOrLiquidatorPresent',
    // ADD THESE:
    EST_OF_IS_TASKED = 'estOfIstasked',
    CHANGE_DECEASED_ADDRESS = 'changeDeceasedAddress',
    EXECUTOR_OR_LIQUIDATOR_EXISTS = 'executorOrLiquidatorExists',
    SET_UP_FROZEN_STATUS = 'setUpFrozenStatusOnEstateAccount',
    ACCOUNT_APPLICATION_IS_VIEWABLE = 'accountApplicationAccountOpeningIsViewable',
    REGULATORY_CUSTOMER_SUMMARY_IS_VIEWABLE = 'regulatoryCustomerSummaryReportIsViewable',
    FORM_90450_IS_SCANNED = 'form90450IsScannedAndViewable',
  }
  
  
  
  taskQuestions: [
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.WILL_NEW_ESTATE_ACCOUNT_BE_OPENED,
      answers: [...yesNoAnswers],
      step: 1,
    },
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.AT_LEAST_ONE_EXECUTOR,
      answers: [...yesNoAnswers],
      step: 1,
      showQuestion: false,
    },
    // ADD THESE 7:
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.EST_OF_IS_TASKED,
      step: 1,
    },
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.CHANGE_DECEASED_ADDRESS,
      step: 1,
    },
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.EXECUTOR_OR_LIQUIDATOR_EXISTS,
      step: 1,
    },
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.SET_UP_FROZEN_STATUS,
      step: 1,
    },
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.ACCOUNT_APPLICATION_IS_VIEWABLE,
      step: 1,
    },
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.REGULATORY_CUSTOMER_SUMMARY_IS_VIEWABLE,
      step: 1,
    },
    {
      questionKey: OpeningNewEstateAccountQuestionKeys.FORM_90450_IS_SCANNED,
      step: 1,
    },
  ],
  