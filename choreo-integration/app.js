const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const toMobile = process.env.TWILIO_TO_MOBILE;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.post('/alert', async (req, res) => {
    const record = req.body.record;
    if (!record || record.severity < 5) {
        return res.status(200).send('OK');
    }

    const smsBody = `🚨 CRITICAL DISASTER ALERT
Type: ${record.title || 'Unknown'}
Reported by: ${record.reporter_name || 'Unknown'}
Severity: 5/5 (Critical)
Location: ${record.latitude}, ${record.longitude}
Immediate response required.`;

    try {
        const client = twilio(accountSid, authToken);
        await client.messages.create({
            body: smsBody,
            from: 'whatsapp:+14155238886',
            to: `whatsapp:${toMobile}`
        });
        console.log('WhatsApp message sent successfully');
        res.status(200).send('OK');
    } catch (err) {
        console.error('WhatsApp failed:', err);
        res.status(500).send('Error');
    }
});

app.listen(8080, () => console.log('Aegis alert service running on port 8080'));
