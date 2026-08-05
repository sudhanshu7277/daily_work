// VerifyPaymentDetailModal.tsx

//change this 
onChange={(val: unknown) => setField(key, String(val ?? ''))}


// to 
onChange={(val: unknown) => setField(key, typeof val === 'string' ? val : String(val || ''))}