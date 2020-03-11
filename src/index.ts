import { S3 } from "aws-sdk";
import { Attachment, ParsedMail } from "mailparser";

import { simpleParser } from "mailparser";

import { INBOX_S3_BUCKET_NAME, DATA_S3_BUCKET_NAME } from "./config";

const s3 = new S3();

interface Header {
  name: string;
  value: string;
}
interface SESEventRecord {
  ses: { mail: { headers: Header[]; timestamp: string; messageId: string } };
}
interface SESEvent {
  Records: SESEventRecord[];
}
export const handler = async (event: SESEvent): Promise<string> => {
  let rawEmailResponse = null;
  let data: ParsedMail;
  let attachments: Attachment[];

  const { ses } = event.Records[0];
  const { timestamp } = ses.mail;

  const { headers }: { headers: Header[] } = ses.mail;
  const origHeaders = headers.filter(h => h.name === "X-OriginatorOrg");

  if (origHeaders.length == 0 || !origHeaders[0].value) {
    return "Error: X-OriginatorOrg missing from email.";
  }
  const origOrg = origHeaders[0].value;

  const getS3Key = (fileName: string): string =>
    `${timestamp.replace(/-/g, "/").replace(/:/g, "-")}_${origOrg}/${fileName}`;

  console.log(
    `Getting raw email ${ses.mail.messageId} from ${INBOX_S3_BUCKET_NAME} for ${origOrg}`
  );
  try {
    rawEmailResponse = await s3
      .getObject({ Bucket: INBOX_S3_BUCKET_NAME, Key: ses.mail.messageId })
      .promise();
  } catch (err) {
    console.log(err);
    return err;
  }

  console.log("Parsing raw email...");
  try {
    data = await simpleParser(
      Buffer.from(rawEmailResponse?.Body?.toString() || "")
    );

    attachments = data?.attachments
      ? data.attachments.filter(
          (a: Attachment) => a.contentDisposition === "attachment"
        )
      : [];
    console.log(`Attachments found: ${JSON.stringify(attachments.length)}`);
  } catch (err) {
    console.log(err);
    return err;
  }

  console.log("Writing Attachments...");
  try {
    await Promise.all(
      attachments.map(async (a: Attachment) => {
        const putResult = await s3
          .putObject({
            Bucket: DATA_S3_BUCKET_NAME,
            Key: getS3Key(a.filename || ""),
            Body: a.content
          })
          .promise();
        console.log(JSON.stringify(putResult));
      })
    );
  } catch (err) {
    console.log(err);
    return err;
  }

  console.log("Writing Metadata...");
  try {
    const metaData = {
      date: data.date,
      subject: data.subject,
      from: data.from.value[0].address,
      text: data.text,
      textAsHtml: data.textAsHtml,
      attachments: attachments.map((a: Attachment) => ({
        contentType: a.contentType,
        contentDisposition: a.contentDisposition,
        filename: a.filename,
        size: a.size,
        s3key: getS3Key(a.filename || "")
      }))
    };
    await s3
      .putObject({
        Bucket: DATA_S3_BUCKET_NAME,
        Key: getS3Key("_meta.json"),
        Body: JSON.stringify(metaData, null, 2)
      })
      .promise();
  } catch (err) {
    console.log(err);
    return err;
  }
  return "Finished processing.";
};
