declare module 'pdf-parse-fork' {
  interface PDFData {
    text: string
    numpages: number
    numrender: number
    info: Record<string, unknown>
    metadata: Record<string, unknown>
    version: string
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: Record<string, unknown>
  ): Promise<PDFData>

  export = pdfParse
}
