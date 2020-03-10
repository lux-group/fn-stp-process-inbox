export const ENVIRONMENT = process.env.NODE_ENV || "test";

export const PRODUCTION = ENVIRONMENT === "production";

export const APP_NAME = process.env.APP_NAME || "test-fn-stp-process-inbox";

export const DEBUG = process.env.DEBUG === "true";

export const INBOX_S3_BUCKET_NAME = process.env.INBOX_S3_BUCKET_NAME || "";
export const DATA_S3_BUCKET_NAME = process.env.DATA_S3_BUCKET_NAME || "";
