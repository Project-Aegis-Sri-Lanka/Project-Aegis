const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromMobile = process.env.TWILIO_FROM_MOBILE;
const toMobile = process.env.TWILIO_TO_MOBILE;

console.log('Starting with config:', {
    accountSid: accountSid ? 'SET' : 'NOT SET',
    authToken: authToken ? 'SET' : 'NOT SET',
    fromMobile: fromMobile ? 'SET' : 'NOT SET',
    toMobile: toMobile ? 'SET' : 'NOT SET'
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
            from: fromMobile,
            to: toMobile
        });
        console.log('SMS sent successfully');
        res.status(200).send('OK');
    } catch (err) {
        console.error('SMS failed:', err);
        res.status(500).send('Error');
    }
});

app.listen(8090, () => console.log('Aegis alert service running on port 8090'));
