# Straight Through Processing (STP) Inbox Processor

[![CircleCI](https://circleci.com/gh/brandsExclusive/fn-stp-process-inbox.svg?style=svg&circle-token=2f4060773e66e6809c1cc8fca99ed7c675df112f)](https://circleci.com/gh/brandsExclusive/fn-stp-process-inbox)

Lambda function that reacts to new objects in an S3 bucket inbox, extracts attachment files and produces metadata JSON file and saves them to a destination S3 bucket for further downstream processing.

## Deployment

To deploy run the following JOBS on jenkins

* [TEST](https://jenkins.luxgroup.com/job/release-test-stp-process-inbox-fn/)

* [PRODUCTION](https://jenkins.luxgroup.com/job/release-prod-stp-process-inbox-fn/)

To deploy locally install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux-mac.html)
and run the following:

TEST

```
$ FN_STP_PROCESS_INBOX_DEV_KEY=xxx FN_SERVICE_PASSWORD=xxx yarn deploy-test
```

PRODUCTION

```
$ FN_STP_PROCESS_INBOX_DEV_KEY=xxx FN_SERVICE_PASSWORD=xxx yarn deploy-production
```

## Logs

This service does not currently forward logs to logentries
Logs can be found by logging into the bex aws account and looking at the following log groups in cloudwatch

* [TEST](https://ap-southeast-2.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-2#logStream:group=/aws/lambda/fn-stp-process-inbox-test)

* [PRODUCTION](https://ap-southeast-2.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-2#logStream:group=/aws/lambda/fn-stp-process-inbox-production)

To tail logs locally install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux-mac.html)
and run the following:

TEST

```
$ yarn logs-test
```

PRODUCTION

```
$ yarn logs-production
```

## Maintainers

* [Justin Hopkins](https://github.com/innomatics)

## Collaborators

* TBA
