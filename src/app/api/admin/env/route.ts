import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

export async function GET() {
    try {
        if (!fs.existsSync(ENV_FILE_PATH)) {
            return NextResponse.json({});
        }
        const data = await fs.promises.readFile(ENV_FILE_PATH, 'utf-8');
        const envVars: Record<string, string> = {};

        data.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes if present
                if (key && !key.startsWith('#')) {
                    envVars[key] = value;
                }
            }
        });

        return NextResponse.json(envVars);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read env file' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // body is Record<string, string>

        let envContent = '';
        for (const [key, value] of Object.entries(body)) {
            // Simple quoting strategy
            envContent += `${key}="${value}"\n`;
        }

        await fs.promises.writeFile(ENV_FILE_PATH, envContent, 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save env file' }, { status: 500 });
    }
}
