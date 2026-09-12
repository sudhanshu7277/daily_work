// In PaymentParent.tsx:
const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

const handleMakerSubmit = async (overrideDuplicate = false) => {
  const payloadToSubmit = currentFormPayload.current;
  if (!payloadToSubmit || !isCurrentFormValid) return;

  setIsSubmitting(true);
  setSubmitErrorMessage(null);

  const endpoint = '/nextgengab/api/api/v1/gab/payments/createMakerPayment';

  const payload = {
    ...payloadToSubmit,
    loginUser: soeId || currentUserId || 'SS71872',
    overrideDuplicateFlag: overrideDuplicate ? 'Y' : 'N',
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'SOEID': soeId || currentUserId || 'SS71872',
        'SM_USER': soeId || currentUserId || 'SS71872',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Submission failed with status ${res.status}: ${res.statusText || 'Forbidden'}`;
      throw new Error(message);
    }

    onPaymentSuccess?.(data?.referenceId || data?.paymentId, payload);
    onClose?.();
  } catch (err: any) {
    console.error('Submission failed:', err);
    // Display error modal directly to user
    setSubmitErrorMessage(err.message || 'Payment submission failed. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};