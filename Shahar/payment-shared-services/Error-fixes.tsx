//

if (type === 'Individual') {
  last?.setValidators([
    Validators.required,
    Validators.maxLength(90),
    Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)
  ]);
  first?.setValidators([
    Validators.required,
    Validators.maxLength(30),
    Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)
  ]);
  middle?.setValidators([
    Validators.maxLength(30),
    Validators.pattern(/^[a-zA-Z0-9\s.'\-]*$/)
  ]);

  
//

onbeforeinputcheck(event: Event, controlName: string, maxLen: number): void {
    const inputEvent = event as InputEvent;
    if (!inputEvent.data) return;

    if (controlName === 'lastName' || controlName === 'firstName' || controlName === 'middleName') {
      // Must allow letters, digits (0-9), spaces, dots, apostrophes, and hyphens
      if (!/^[a-zA-Z0-9\s.'\-]*$/.test(inputEvent.data)) {
        inputEvent.preventDefault();
      }
    }
  }