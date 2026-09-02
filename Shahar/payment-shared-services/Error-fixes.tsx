async getItemPicture(filename: string): Promise<ReadStream> {
  const publicDirectory = path.resolve(process.cwd(), 'images/public');
  const safeFilename = path.basename(filename);
  const filepath: string = path.resolve(publicDirectory, safeFilename);

  const itemPicture: ReadStream = createReadStream(filepath);
  return itemPicture;
}