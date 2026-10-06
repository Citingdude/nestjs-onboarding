/*
This function builds a Content-Disposition header value that includes
both an ASCII fallback filename and a UTF-8 encoded filename.
This ensures that the filename is correctly interpreted by browsers that support UTF-8,
while still providing a fallback for older browsers that may not support it.
 */
export function buildContentDispositionHeader (fileName: string): string {
  const asciiFileName = fileName.replace(/[^\x20-\x7E]/g, '')
  const utf8FileName = encodeURIComponent(fileName.normalize())
  return `attachment; filename="${asciiFileName}"; filename*=UTF-8''${utf8FileName}`
}
