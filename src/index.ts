//import { S3Event } from "aws-lambda";
import { S3 } from "aws-sdk";

import { PRODUCTION, INBOX_S3_BUCKET_NAME } from "./config";

const s3 = new S3();

export async function handler(
  event: any, // S3Event
  context: any,
  callback: any,
): Promise<string> {
  console.log('Process email');
 
    var sesNotification = event.Records[0].ses;
    console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));
    
    // Retrieve the email from your bucket
    s3.getObject({
            Bucket: INBOX_S3_BUCKET_NAME,
            Key: sesNotification.mail.messageId
        }, function(err: any, data: any) {
            if (err) {
                console.log(err, err.stack);
                callback(err);
            } else {
                console.log("Raw email:\n" + data.Body);
                
                // Custom email processing goes here
                
                callback(null, null);
            }
        });
        return 'Processed';
}
