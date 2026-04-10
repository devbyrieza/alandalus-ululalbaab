import fs from 'fs';
import path from 'path';

// Define storage directory outside of public to prevent direct access
// Use environment variable if available, otherwise default to 'storage_data' in the current working directory
const STORAGE_DIR = process.env.STORAGE_PATH 
    ? path.resolve(process.env.STORAGE_PATH) 
    : path.resolve(process.cwd(), 'storage_data');

/**
  * Save a file to the local filesystem
 * @param file The file object from FormData
 * @param category The category folder (e.g., 'dokumen-pendaftaran', 'bukti-pembayaran')
 * @param subfolder The subfolder (usually user ID or registration number)
 * @param filename The desired filename
 * @returns The relative path to the saved file
 */
export async function saveFileLocal(
    file: File,
    category: string,
    subfolder: string,
    filename: string
): Promise<string> {
    try {
        // Ensure the directory exists
        const targetDir = path.join(STORAGE_DIR, category, subfolder);
        if (!fs.existsSync(targetDir)) {
            console.log(`[Storage] Creating directory: ${targetDir}`);
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define full path
        const filePath = path.join(targetDir, filename);

        // Write file
        console.log(`[Storage] Writing file: ${filePath}`);
        fs.writeFileSync(filePath, buffer);

        // Return relative path for database storage
        // Format: category/subfolder/filename (using posix for DB consistency)
        return path.posix.join(category, subfolder, filename);
    } catch (error: any) {
        console.error(`[Storage] ❌ Failed to save file: ${error.message}`);
        throw error; // Rethrow to be caught by the API route
    }
}

/**
 * Get a file buffer from local storage
 * @param relativePath The relative path stored in database
 * @returns The file buffer and mime type, or null if not found
 */
export function getFileLocal(relativePath: string): { buffer: Buffer; mimeType: string } | null {
    try {
        // Sanitize relative path to remove leading slashes which can mess up path.join
        const sanitizedPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
        const fullPath = path.join(STORAGE_DIR, sanitizedPath);

        // Basic security check to prevent directory traversal
        if (!fullPath.startsWith(STORAGE_DIR)) {
            console.error(`[Storage] ❌ Security violation: Path traversal attempt - ${fullPath}`);
            return null;
        }

        if (fs.existsSync(fullPath)) {
            const buffer = fs.readFileSync(fullPath);
            // Simple mime type detection based on extension
            const ext = path.extname(fullPath).toLowerCase();
            let mimeType = 'application/octet-stream';
            if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
            else if (ext === '.png') mimeType = 'image/png';
            else if (ext === '.webp') mimeType = 'image/webp';
            else if (ext === '.pdf') mimeType = 'application/pdf';

            console.log(`[Storage] ✅ File served: ${fullPath} (${mimeType})`);
            return { buffer, mimeType };
        }
        
        // Detailed logging for diagnostics
        console.error(`[Storage] ❌ File NOT found: ${fullPath}`);
        console.log(`[Storage] Details: CWD=${process.cwd()}, STORAGE_DIR=${STORAGE_DIR}`);
        
        const parentDir = path.dirname(fullPath);
        if (!fs.existsSync(parentDir)) {
            console.error(`[Storage] ❌ Parent directory missing: ${parentDir}`);
        } else {
            console.log(`[Storage] Parent directory exists. Scanning content...`);
            try {
                const files = fs.readdirSync(parentDir);
                console.log(`[Storage] Files in directory: ${files.join(', ')}`);
            } catch (e) {
                console.error(`[Storage] ❌ Failed to scan parent directory: ${parentDir}`);
            }
        }
    } catch (error: any) {
        console.error(`[Storage] ❌ Error in getFileLocal: ${error.message}`);
    }
    
    return null;
}

/**
 * Delete a file from local storage
 * @param relativePath The relative path stored in database
 */
export function deleteFileLocal(relativePath: string): boolean {
    const fullPath = path.join(STORAGE_DIR, relativePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
    }
    return false;
}
