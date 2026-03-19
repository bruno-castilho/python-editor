export interface IStorage {
  upload(params: { body: Buffer; contentType: string }): Promise<{
    fileId: string
  }>

  delete(params: { fileId: string }): Promise<void>
}
