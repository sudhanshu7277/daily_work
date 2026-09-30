//The Fix
// Navigate to the useEffect around lines 292–316 in PaymentParent.tsx


useEffect(() => {
    // 1. Resolve instructionId safely
    const currentId = instructionId || (instruction as any)?.instructionId || (instruction as any)?.id;
    
    // Guard: do not trigger if no instruction is selected
    if (!currentId) return;

    let isMounted = true;
    const loadInitialDetailsForAction = async () => {
      try {
        setIsLoadingActionDetails(true);
        const details = await fetchDetailsForAction();

        if (isMounted) {
          setActionDetailsList(details);
          const rawAccounts = instruction?.accounts || [];
          const updatedAccounts = mergeAccountsWithActionDetails(rawAccounts, details);
          onAccountsUpdate?.(updatedAccounts);
        }
      } catch (err) {
        console.error('Failed to load initial details-for-action:', err);
      } finally {
        if (isMounted) {
          setIsLoadingActionDetails(false);
        }
      }
    };

    loadInitialDetailsForAction();

    return () => {
      isMounted = false;
    };
  }, [
    instructionId,
    (instruction as any)?.instructionId,
    (instruction as any)?.id,
  ]); // <-- Add instruction identifiers to the dependency array!
```[cite: 55, 56]

---

### Ensure `fetchDetailsForAction` Also Uses the Dynamic ID

Check lines 674–694 in `PaymentParent.tsx` where the body is formatted[cite: 56]:

```typescript
  const fetchDetailsForAction = async (): Promise<any[]> => {
    const currentId = instructionId || (instruction as any)?.instructionId || (instruction as any)?.id;

    if (!currentId) {
      console.warn('fetchDetailsForAction skipped: no valid instructionId found');
      return [];
    }

    const endpoint = '/nextgengab/api/api/v1/gab/payments/payment/details-all-stage';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          SOEID: soeId || currentUserId,
        },
        body: JSON.stringify({
          instructionId: currentId,
          applicationName: 'GAB',
          moduleName: 'GAB-LATAM',
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

  
```[cite: 56]



//### Why This Resolves It
// Adding the instruction identity to the dependency array forces React to re-evaluate the effect each time a user selects a new instruction from the UI list, triggering `fetchDetailsForAction()` dynamically without requiring a manual browser reload or page remount[cite: 55, 56].
