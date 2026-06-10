import ballerina/http;
import ballerina/log;
import ballerinax/twilio;

configurable string accountSid = ?;
configurable string authToken = ?;
configurable string fromMobile = ?;
configurable string toMobile = ?;

type SupabasePayload record {
    string 'type?;
    Record 'record?;
};

type Record record {
    string title?;
    string description?;
    string reporter_name?;
    int severity?;
    float latitude?;
    float longitude?;
};

service /aegis on new http:Listener(8090) {

    resource function post alert(@http:Payload SupabasePayload payload) returns http:Response {
        http:Response response = new;

        Record? reportRecord = payload.'record;
        if reportRecord is () {
            response.statusCode = 400;
            return response;
        }

        int severity = reportRecord.severity ?: 0;
        if severity < 5 {
            response.statusCode = 200;
            return response;
        }

        string title = reportRecord.title ?: "Unknown Incident";
        string reporter = reportRecord.reporter_name ?: "Unknown";
        float lat = reportRecord.latitude ?: 0.0;
        float lng = reportRecord.longitude ?: 0.0;

        string smsBody = string `🚨 CRITICAL DISASTER ALERT
Type: ${title}
Reported by: ${reporter}
Severity: 5/5 (Critical)
Location: ${lat}, ${lng}
Immediate response required.`;

        twilio:ConnectionConfig twilioConfig = {
            auth: {
                username: accountSid,
                password: authToken
            }
        };

        twilio:Client|error twilioClient = new (twilioConfig);
        if twilioClient is error {
            log:printError("Twilio client init failed", twilioClient);
            response.statusCode = 500;
            return response;
        }

        twilio:CreateMessageRequest messageRequest = {
            To: toMobile,
            From: fromMobile,
            Body: smsBody
        };

        twilio:Message|error result = twilioClient->createMessage(messageRequest);
        if result is error {
            log:printError("SMS failed", result);
        } else {
            log:printInfo("SMS sent successfully");
        }

        response.statusCode = 200;
        return response;
    }
}