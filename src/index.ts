import { S3 } from "aws-sdk";
import async from "async";

import { simpleParser } from "mailparser";

import { INBOX_S3_BUCKET_NAME, DATA_S3_BUCKET_NAME } from "./config";

const s3 = new S3();

export function handler(event: any, context: any, callback: any) {
  const { ses } = event.Records[0];
  const { timestamp } = ses.mail;
  //console.log('SES Notification:\n', JSON.stringify(ses, null, 2))

  interface Header {
    name: string;
    value: string;
  }
  const { headers }: { headers: Header[] } = ses.mail;
  const origHeaders = headers.filter(h => h.name === "X-OriginatorOrg");

  if (origHeaders.length == 0 || !origHeaders[0].value) {
    callback("X-OriginatorOrg missing from email.");
    return;
  }
  const origOrg = origHeaders[0].value;

  const getS3Key = (fileName: string) =>
    `${timestamp.replace(/-/g, "/")}_${origOrg}/${fileName}`;

  const getAttachments = (data: any) =>
    data.attachments.filter((a: any) => a.contentDisposition === "attachment");

  async.waterfall(
    [
      function getRawEmail(next: any) {
        console.log(
          `Getting raw email ${ses.mail.messageId} from ${INBOX_S3_BUCKET_NAME} for ${origOrg}`
        );
        s3.getObject(
          {
            Bucket: INBOX_S3_BUCKET_NAME,
            Key: ses.mail.messageId
          },
          next
        );
      },
      function parseEmail(response: any, next: any) {
        console.log("Parsing raw email...");
        simpleParser(response.Body, {}, next);
      },
      function writeMetadata(data: any, next: any) {
        console.log("Writing Attachments...");
        getAttachments(data).forEach((a: any) => {
          s3.putObject(
            {
              Bucket: DATA_S3_BUCKET_NAME,
              Key: getS3Key(a.filename),
              Body: a.content
            },
            (err: any, data: any) => {
              if (err) {
                next(err);
              }
            }
          );
        });
        console.log("Writing Metadata...");
        const metaData = {
          date: data.date,
          subject: data.subject,
          from: data.from.value[0].address,
          text: data.text,
          textAsHtml: data.textAsHtml,
          attachments: getAttachments(data).map((a: any) => ({
            contentType: a.contentType,
            contentDisposition: a.contentDisposition,
            filename: a.filename,
            size: a.size,
            s3key: getS3Key(a.filename)
          }))
        };
        s3.putObject(
          {
            Bucket: DATA_S3_BUCKET_NAME,
            Key: getS3Key("_meta.json"),
            Body: JSON.stringify(metaData, null, 2)
          },
          next
        );
      }
    ],
    function(err) {
      if (err) {
        console.error(err);
        callback(err);
      } else {
        callback(null, "success");
      }
    }
  );
}
