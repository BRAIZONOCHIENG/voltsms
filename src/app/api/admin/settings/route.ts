import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/json-db';

const SETTINGS_FILE = 'settings.json';

interface Settings {
    maintenance_mode: boolean;
    sms_threshold_warning: number;
    sms_threshold_critical: number;
}

const DEFAULT_SETTINGS: Settings = {
    maintenance_mode: false,
    sms_threshold_warning: 0.50,
    sms_threshold_critical: 0.10
};

export async function GET() {
    const settings = await readJson<Settings>(SETTINGS_FILE, DEFAULT_SETTINGS);
    return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const currentSettings = await readJson<Settings>(SETTINGS_FILE, DEFAULT_SETTINGS);

    // Merge new settings
    const updatedSettings = { ...currentSettings, ...body };
    await writeJson(SETTINGS_FILE, updatedSettings);

    return NextResponse.json(updatedSettings);
}
