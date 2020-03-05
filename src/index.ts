import { S3 } from 'aws-sdk'
import async from 'async'

import { simpleParser } from 'mailparser'

import { INBOX_S3_BUCKET_NAME, DATA_S3_BUCKET_NAME } from './config'
import { callbackify } from 'util'

const s3 = new S3()

export function handler (event: any, context: any, callback: any) {
  console.log('Process email')

  var sesNotification = event.Records[0].ses
  console.log('SES Notification:\n', JSON.stringify(sesNotification, null, 2))

  interface Header {
    name: string
    value: string
  }
  const mailHeaders: Header[] = sesNotification.mail.headers
  const origHeaders = mailHeaders.filter(h => h.name === 'X-OriginatorOrg')

  if (origHeaders.length == 0 || !origHeaders[0].value) {
     callback('X-OriginatorOrg missing from email')
     return
  }
  const orig = origHeaders[0].value

  async.waterfall(
    [
      function getRawEmail (next: any) {
        console.log(
          `Getting raw email ${
            sesNotification.mail.messageId
          } from ${INBOX_S3_BUCKET_NAME}`
        )
        s3.getObject(
          {
            Bucket: INBOX_S3_BUCKET_NAME,
            Key: sesNotification.mail.messageId
          },
          next
        )
      },
      function parseEmail (response: any, next: any) {
        console.log(JSON.stringify(response))
        console.log('Parsing raw email...')
        simpleParser(response.Body, {}, next)
      },
      function writeMetadata (data: any, next: any) {
        console.log('Writing Metadata...')
        const metaData = {
          date: data.date,
          subject: data.subject,
          from: data.from.value[0].address,
          text: data.text,
          textAsHtml: data.textAsHtml,
          attachments: data.attachments.map((a: any) => ({
            contentType: a.contentType,
            contentDisposition: a.contentDisposition,
            filename: a.filename,
            size: a.size
          }))
        }
        data.attachments.forEach((a: any) => {
          s3.putObject(
            {
              Bucket: DATA_S3_BUCKET_NAME,
              Key: `${sesNotification.mail.timestamp}_${orig}_${a.filename}`,
              Body: a.content
            },
            (err: any, data: any) => {
              if (err) {
                next(err)
              }
            }
          )
        })
        s3.putObject(
          {
            Bucket: DATA_S3_BUCKET_NAME,
            Key: `${sesNotification.mail.timestamp}_${orig}_meta.json`,
            Body: JSON.stringify(metaData)
          },
          next
        )
      }
    ],
    // TODO write attachment files
    function (err) {
      if (err) {
        console.error(err)
        callback(err)
      } else {
        console.log('Waterfall Success')
      }
      callback(null, 'WTF')
    }
  )
}
