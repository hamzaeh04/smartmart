let counter = Math.floor(Math.random() * 1000);

/** Simple monotonic id generator for mock records (unique within a session). */
export function generateId(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

export function generateSku(categoryName: string, sequence: number): string {
  const prefix = categoryName.slice(0, 3).toUpperCase().padEnd(3, "X");
  return `${prefix}-${String(sequence).padStart(5, "0")}`;
}

export function generateBarcode(): string {
  // EAN-13-shaped numeric string (not checksum-validated, mock only)
  let code = "2";
  for (let i = 0; i < 11; i += 1) {
    code += Math.floor(Math.random() * 10).toString();
  }
  let sum = 0;
  for (let i = 0; i < 12; i += 1) {
    sum += Number(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return code + checkDigit;
}

export function generateQrValue(sequence: number): string {
  return `PRODUCT-${String(sequence).padStart(6, "0")}`;
}

export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(sequence).padStart(5, "0")}`;
}

export function generatePurchaseNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `PO-${year}-${String(sequence).padStart(5, "0")}`;
}
