// tasks.config.ts — replace lines 295-308:

taskQuestions: [
    {
      questionKey: 'willNewEstateAccountBeOpened',
      answers: [...yesNoAnswers],
      step: 1,
    },
    {
      questionKey: 'atLeastOneExecutorOrLiquidatorPresent',
      step: 1,
      showQuestion: false,
    },
    {
      questionKey: 'estOfIstasked',
      step: 1,
    },
    {
      questionKey: 'changeDeceasedAddress',
      step: 1,
    },
    {
      questionKey: 'executorOrLiquidatorExists',
      step: 1,
    },
    {
      questionKey: 'setUpFrozenStatusOnEstateAccount',
      step: 1,
    },
    {
      questionKey: 'accountApplicationAccountOpeningIsViewable',
      step: 1,
    },
    {
      questionKey: 'regulatoryCustomerSummaryReportIsViewable',
      step: 1,
    },
    {
      questionKey: 'form90450IsScannedAndViewable',
      step: 1,
    },
  ],

  // OpeningNewEstateAccountQuestionKeys