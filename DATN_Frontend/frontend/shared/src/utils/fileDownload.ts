// fileDownload.ts
export function getFilenameFromContentDisposition(
  disposition?: string
): string | undefined {
  if (!disposition) return;
  // ví dụ: attachment; filename="report.xlsx"; filename*=UTF-8''b%C3%A1o_c%C3%A1o.xlsx
  const filenameStar = /filename\*=([^;]+)/i.exec(disposition)?.[1]; // UTF-8''...
  if (filenameStar) {
    // remove charset'' and decode
    const parts = filenameStar.split("''");
    const encoded = parts.length === 2 ? parts[1] : filenameStar;
    try {
      return decodeURIComponent(encoded.replace(/^"(.*)"$/, '$1'));
    } catch {
      // no-op
    }
  }
  const filename = /filename=([^;]+)/i.exec(disposition)?.[1];
  if (filename) return filename.trim().replace(/^"(.*)"$/, '$1');
}

export function saveBlob(blob: Blob, filename?: string) {
  const name =
    filename ||
    `export-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`;
  // IE/Edge cũ
  // @ts-expect-error: TODO fix type later
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // @ts-expect-error: TODO fix type later
    window.navigator.msSaveOrOpenBlob(blob, name);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Nếu BE trả lỗi JSON nhưng responseType=blob ⇒ cần đọc lại blob để show message
export async function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
}
