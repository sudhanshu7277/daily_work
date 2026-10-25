//The Fix
// In SplitPaymentMakerModal.tsx, update lines 556–560:

const activeDoc = docs.find(
  (d) => String(d.documentId ?? d.id) === String(selectedDocId)
);

if (activeDoc) {
  // Resolve valid document ID without coercing non-numeric/string IDs to NaN
  const docId = activeDoc.documentId ?? activeDoc.id ?? selectedDocId;
  const parsedDocId = !isNaN(Number(docId)) ? Number(docId) : docId;

  const previewUrl = await getDocumentPreviewBlob(instructionId, parsedDocId as any);
  revoked = previewUrl;