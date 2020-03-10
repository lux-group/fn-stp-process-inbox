# Straight Through Processing (STP) Inbox Processor

[![CircleCI](https://circleci.com/gh/brandsExclusive/fn-stp-process-inbox.svg?style=svg)](https://circleci.com/gh/brandsExclusive/fn-stp-process-inbox)

Lambda function that reacts to new objects in an S3 bucket inbox, extracts attachment files and produces metadata JSON file and saves them to a destination S3 bucket for further downstream processing.

## Configuration

The function is fired by an SES action as part of receipt rules see [here](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-receipt-rules.html) for further info.

See config files in `./deploy` folder for lambda naming, S3 inbox and S3 output bucket names.

## Deployment

To deploy run the following JOBS on jenkins

TODO: configure jenkins

* [TEST](https://jenkins.luxgroup.com/job/release-test-stp-process-inbox-fn/)

* [PRODUCTION](https://jenkins.luxgroup.com/job/release-prod-stp-process-inbox-fn/)

To deploy locally install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux-mac.html)
and run the following:

TEST

```
$ yarn deploy-test
```

PRODUCTION

```
$ yarn deploy-production
```

## Logs

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
