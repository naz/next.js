import { existsSync, promises } from 'fs'
import path from 'path'
import isError from './is-error'

export enum FileType {
  File = 'file',
  Directory = 'directory',
}

const ROOT_DIR = path.resolve('/safe/root/directory'); // Define the safe root directory

export async function fileExists(
  fileName: string,
  type?: FileType
): Promise<boolean> {
  try {
    // Normalize the file path and ensure it is within the safe root directory
    const resolvedPath = path.resolve(ROOT_DIR, fileName);
    if (!resolvedPath.startsWith(ROOT_DIR)) {
      throw new Error('Access to the file path is not allowed.');
    }

    if (type === FileType.File) {
      const stats = await promises.stat(resolvedPath);
      return stats.isFile();
    } else if (type === FileType.Directory) {
      const stats = await promises.stat(resolvedPath);
      return stats.isDirectory();
    }

    return existsSync(resolvedPath);
  } catch (err) {
    if (
      isError(err) &&
      (err.code === 'ENOENT' || err.code === 'ENAMETOOLONG')
    ) {
      return false;
    }
    throw err;
  }
}
