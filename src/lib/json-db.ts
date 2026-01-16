import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export async function readJson<T>(filename: string, defaultValue: T): Promise<T> {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        await writeJson(filename, defaultValue);
        return defaultValue;
    }
    const data = await fs.promises.readFile(filePath, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return defaultValue;
    }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
    const filePath = path.join(DATA_DIR, filename);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
