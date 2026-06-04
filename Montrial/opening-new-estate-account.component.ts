// Line 111, temporarily change to:
console.log('allQuestions with steps:', allQuestions.map(q => ({name: q.name, step: q.step})));
console.log('currentStep:', currentStep);
return allQuestions.filter((questions) => questions.step === currentStep);