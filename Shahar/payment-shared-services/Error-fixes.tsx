//The Exact Fix in PaymentParent.tsxIn PaymentParent.tsx, replace line 1042:   

onFailedFieldListChange={activeTab === 'checker' ? setCheckerFailedFields : undefined}

//With this clean callback and two-way sync:

onFailedFieldListChange={(fields: string[]) => {
    setCheckerFailedFields(fields);
  }}

  //Also pass the current flagged list to ensure state preservation across re-renders:
//Just above or below line 1023 (isCheckerMode={activeTab === 'checker'}), add:

repairReviewFieldList={activeTab === 'repair' ? repairReviewFieldList : undefined}
repairNewlyModifyFieldList={activeTab === 'repair' ? repairNewlyModifiedFields : undefined}
onFailedFieldListChange={(fields: string[]) => {
  setCheckerFailedFields(fields);
}}