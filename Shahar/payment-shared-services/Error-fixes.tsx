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



  //The Fix: Add Fallback in loadDocument
// In SplitPaymentMakerModal.tsx, wrap the getDocumentPreviewBlob 
// call with a fallback to getPaymentSourceFile(instructionId) when 
// the preview call fails due to DMC being disabled:


const loadDocument = async () => {
  try {
    const activeDoc = docs.find((d) => String(d.documentId) === String(selectedDocId));
    if (activeDoc) {
      let previewUrl: string | null = null;
      try {
        previewUrl = await getDocumentPreviewBlob(instructionId, Number(activeDoc.documentId));
      } catch (blobErr: any) {
        console.warn('Document preview endpoint failed, attempting fallback to payment source file:', blobErr);
        // Fallback for environments where DMC integration is not enabled[cite: 141]
        const fallbackFile = await getPaymentSourceFile(instructionId).catch(() => null);
        if (fallbackFile && fallbackFile.url) {
          previewUrl = fallbackFile.url;
        } else {
          throw blobErr;
        }
      }

      revoked = previewUrl;
      const fileName = activeDoc.fileName || 'document.pdf';
      const fileType = resolvePreviewFileType(fileName, activeDoc.contentType);
      const contentType = activeDoc.contentType || (fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream');

      const response = await fetch(previewUrl);
      if (!response.ok) {
        throw new Error(`Failed to load document content (${response.status})`);
      }
      const buffer = await response.arrayBuffer();

      if (isMounted) {
        setSource({ url: previewUrl, buffer, fileName, fileType, contentType });
      }
    } else {
      const file = await getPaymentSourceFile(instructionId);
      if (file && file.url) {
        revoked = file.url;
        if (isMounted) setSource(file);
      } else {
        throw new Error('No source document returned for this instruction.');
      }
    }
  } catch (err: any) {
    if (isMounted) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load document from DMC.';
      setSourceError(msg);
    }
  } finally {
    if (isMounted) {
      setSourceLoading(false);
    }
  }
};