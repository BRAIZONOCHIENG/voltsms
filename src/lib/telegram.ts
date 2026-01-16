export async function sendTelegramMessage(message: string) {
    const botToken = process.env.BOT_TOKEN;
    const adminId = process.env.ADMIN_ID;

    if (!botToken || !adminId) {
        console.warn('Telegram Bot Token or Admin ID not set. Skipping alert.');
        return;
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: adminId,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
    }
}
