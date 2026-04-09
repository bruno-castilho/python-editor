export interface IStorage {
  upload(params: {
    body: Buffer
    contentType: string
  }): Promise<{ fileId: string }>

  replace(params: {
    fileId: string
    body: Buffer
    contentType: string
  }): Promise<void>

  delete(params: { fileId: string }): Promise<void>

  download(params: { fileId: string }): Promise<Buffer>
}
