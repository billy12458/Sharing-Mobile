export function getFileId(row: any): string {
  return row?._id ?? row?.id ?? ''
}

/**
 * Build a normal file download URL.
 *
 * Backend:
 * GET /files/download/{_id}?password={password}
 */
export function getRowDownloadUrl(
  row: any,
  password = '',
): string {
  const fileId = getFileId(row)

  if (!fileId) {
    throw new Error('File id is missing.')
  }

  const query = password
    ? `?password=${encodeURIComponent(password)}`
    : ''

  return `${
    import.meta.env.VITE_API_BASE_URL
  }/files/download/${encodeURIComponent(fileId)}${query}`
}

/**
 * Start a normal file download.
 */
export function rowDownload(
  row: any,
  password = '',
): void {
  const url = getRowDownloadUrl(row, password)
  window.location.href = url
}

/**
 * Build an extraction-code download URL.
 */
export function getCodeDownloadUrl(code: string): string {
  return `${
    import.meta.env.VITE_API_BASE_URL
  }/files/download/byCode?code=${encodeURIComponent(code)}`
}

/**
 * Start an extraction-code download.
 */
export function codeDownload(code: string): void {
  window.location.href = getCodeDownloadUrl(code)
}
