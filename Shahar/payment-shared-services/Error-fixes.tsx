// 1. The Helper Function
// Place this above handleMakerSubmit (around line ~440 in PaymentParent.tsx):


/**
 * Fetches post-submission details-for-action list.
 * Returns an array of action detail objects.
 */
const fetchDetailsForAction = async (): Promise<any[]> => {
  const endpoint = '/nextgengab/api/api/v1/gab/payments/payment/details-for-action';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        SOEID: 'SS71872',
      },
      body: JSON.stringify({
        application: 'GAB',
        module: 'GAB-LATAM',
        action: 'APPROVED',
        checker: '',
        dualBlindlyModel: null,
      }),
    });

    if (!res.ok) {
      console.warn(`details-for-action failed with status: ${res.status}`);
      return [];
    }

    const json = await res.json();
    return Array.isArray(json) ? json : [json];
  } catch (error) {
    console.error('Failed to fetch details-for-action:', error);
    return [];
  }
};


// 2. Updated handleMakerSubmit
// Now call it cleanly right after const data = await res.json(); (lines ~466–478):


const data = await res.json();

    // Call the separated API function and capture the array response
    const actionDetails = await fetchDetailsForAction();
    console.log('Captured action details:', actionDetails);

    const refId =
      data?.paymentId ||
      data?.referenceId ||
      data?.paymentReferenceId ||
      data?.id ||
      'N/A';

    onPaymentSuccess?.(refId, payloadToSubmit, actionDetails);
    onClose?.();
  } catch (err: any) {
    console.error('Payment submission failed:', err);
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      'Payment submission failed';
    onPaymentError?.(msg);
  } finally {
    setIsSubmitting(false);
  }
};




//Update lines 96–100 in vite.config.ts to include optimizeDeps and build:   

esbuild: {
  target: 'esnext',
},
optimizeDeps: {
  esbuildOptions: {
    target: 'esnext',
    supported: {
      'top-level-await': true,
    },
  },
},
build: {
  target: 'esnext',
},



server: {
  port: 3002,
  proxy: {
    '/nextgengab/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/nextgengab\/api/, ''),
    },
  },
},