// Updated getPaymentSourceFile Function
//Replace lines 95–101 in paymentDetails.ts with the following:

export async function getPaymentSourceFile(instructionId: number): Promise<PaymentSourceFile> {
  const response = await client.get<Blob>(
    `/instructions/${instructionId}/payment-details/source-file`,
    { responseType: 'blob' },
  );

  const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
  const contentType = String(response.headers['content-type'] ?? '');
  const buffer = await blob.arrayBuffer();

  let fileType = 'other';
  if (contentType.includes('pdf')) {
    fileType = 'pdf';
  } else if (
    contentType.includes('spreadsheet') ||
    contentType.includes('excel') ||
    contentType.includes('ms-excel')
  ) {
    fileType = 'excel';
  } else if (contentType.includes('csv')) {
    fileType = 'csv';
  }

  return { url: URL.createObjectURL(blob), buffer, fileType, contentType };
}