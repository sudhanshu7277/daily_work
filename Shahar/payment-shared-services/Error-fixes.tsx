///update lines 1831–1837 where/

/// Bypass hardcap validation in checker mode with the exact property names the library expects
hardcapResultReceived={
  activeTab === 'checker'
    ? {
        amountWithinLimit: true,
        hardCapValue: 999999999999,
      }
    : activeTab === 'maker' || activeTab === 'repair'
    ? makerHardcapResult
    : undefined
}
onAmountChange={
  activeTab === 'maker' || activeTab === 'repair'
    ? handleAmountChange
    : undefined
}