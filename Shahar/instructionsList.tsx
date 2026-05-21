const loadReportData = useCallback(async () => {
    console.log('AM I GETTING CALLED !!');
    
    // 🌟 Defensive Fallback: If year or month parameters aren't ready yet, use the current date instead of breaking
    const queryYear = year || new Date().getFullYear();
    const queryMonth = month || (new Date().getMonth() + 1);

    setLoading(true);
    setError('');
    
    try {
      let result: { data: PagedResponse<InstructionResponse> | InstructionResponse[] };
      try {
        // Pass the safely-calculated dates to prevent API crashes
        result = await getCompletedInstructionsReport({ year: queryYear, month: queryMonth, size: 500 });
      } catch {
        result = await getInstructions({ status: 'COMPLETED', size: 500 });
      }
      
      const items = Array.isArray(result.data)
        ? result.data
        : (result.data as PagedResponse<InstructionResponse>).content || [];
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]); // Dependencies stay intact safely