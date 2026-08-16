//1. Critical Syntax Error at Line 454

// In TypeScript, you cannot pass a type annotation (: Pain001Model) inside a function invocation.

paymentData: buildPain001FromForm(formValues as any),
// OR if buildPain001FromForm accepts Pain001Model:
paymentData: buildPain001FromForm(formValues),

// 2. Type Definition Fix in paymentUtils.ts

//To eliminate all type squiggles without needing type assertions, update the f
// unction signature in src/pages/ss-payment/utils/paymentUtils.ts:

export function buildPain001FromForm(
    formValues: Pain001Model | Record<string, unknown> | Record<string, any>
  ): Pain001Model {
    const base = createEmptyPain001();
    const result: Record<string, any> = { ...base };
    const raw = formValues as Record<string, any>;
  
    Object.keys(base).forEach(key => {
      if (raw[key] === undefined) return;
      result[key] = NUMERIC_FIELDS.has(key as any)
        ? (parseFloat(String(raw[key])) || 0)
        : raw[key];
    });
  
    if (raw.creditorAgentAccountNumber && !result.creditorAgentPostalAddress) {
      result.creditorAgentPostalAddress = raw.creditorAgentAccountNumber;
    }
  
    return result as Pain001Model;
  }