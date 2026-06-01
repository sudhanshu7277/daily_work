createTasksTemplate(action: any): Observable<ECETaskBody> {
    // 1. If caseId is null, pass the explicit string literal "null" to match the microservice route tree expectation
    const urlParam = action.caseId ? action.caseId : 'null';
    const url = `${environment.endpointUrl.case}/${urlParam}/tasks`;
  
    // 2. Map the request payload body cleanly
    // If your action payload contains a nested object or property, ensure it maps to what the backend wants
    const body = {
      caseId: action.caseId, // Will pass null safely here
      primaryResidenceOnDod: action.primaryResidenceOnDod || "ANY_PROVINCE_EXCEPT_QUEBEC"
    };
  
    console.log('Target URL Path:', url);
    console.log('HTTP POST JSON Body Payload:', body);
  
    // 3. Fire the POST request, ensuring the body object replaces the previous 'null' argument
    return this.http.post<ECETaskBody>(url, body);
  }