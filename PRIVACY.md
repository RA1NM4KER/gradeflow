# Privacy Policy

Last updated: April 3, 2026

## Overview

GradeLog is a local-first grade tracker.

You do not need an account to use GradeLog locally. By default, your grades stay on your device.

If you choose to connect your devices, GradeLog can sync your data across those devices using a remote service. That sync is optional.

## What GradeLog does by default

When you use GradeLog without connecting devices:

- your grade data is stored locally on your device
- the app works offline after it has been loaded
- no account is required
- backup export and import happen locally

In this mode, GradeLog does not require a cloud database to provide its core functionality.

## Optional connected devices

If you choose to connect your devices:

- you create or sign in to an account using email and password
- GradeLog stores sync data on a remote service so your devices can stay in sync
- your local device remains the primary working copy
- changes made offline can sync later when you reconnect

Connected-device sync is optional. You can disconnect at any time.

## Data we process

Depending on how you use GradeLog, the following data may be processed:

### Local app data

Stored on your device:

- semesters
- courses
- assignments and grouped categories
- grades, weightings, cutoffs, and related academic tracking data
- local app settings and sync metadata needed for the app to function

### Optional account and sync data

Stored remotely only if you choose to connect your devices:

- your email address
- authentication session data
- device identifiers used to keep your devices in sync
- synced academic data and sync operation records

## Current encryption status

GradeLog is built around a privacy-first product direction, but synced data is **not yet end-to-end encrypted**.

Today, when connected-device sync is enabled, synced academic data is stored on a remote service in a form that may be readable by the service operator.

The intended long-term standard for GradeLog is:

- grades are end-to-end encrypted
- raw academic data is not readable by the server by default
- privacy is treated as a product constraint, not a later patch

Until that encryption model exists, you should assume that connected-device sync involves storing sync data remotely in a readable form.

## How your data is used

GradeLog uses data only to provide the product’s functionality, including:

- storing and showing your grade data on your device
- calculating standings, averages, and grade thresholds
- restoring backups that you import
- authenticating you if you choose to connect your devices
- syncing changes between your devices when sync is enabled

GradeLog is not built around advertising, social sharing, or selling academic data.

## Third-party services

GradeLog currently uses Supabase for optional authentication and sync infrastructure.

If you enable connected-device sync, relevant account and sync data is processed through that provider.

## Data sharing

GradeLog does not sell your data.

When sync is disabled, your data is intended to remain on your device except where you explicitly export it.

When sync is enabled, your data is shared with the sync infrastructure required to authenticate your account and keep your connected devices in sync.

## Retention

Local data remains on your device until you delete it, uninstall the app, clear browser/app storage, or replace it through import/restore.

If you use optional sync, synced data may remain on the remote service until it is deleted through future account or sync-data management features, or otherwise removed through operational cleanup.

Retention and deletion controls will become more explicit as the sync feature matures.

## Your choices

You can choose to:

- use GradeLog entirely locally with no account
- export your local data
- import or replace local data manually
- connect your devices for optional sync
- disconnect sync later

If you prefer not to store academic data remotely, do not enable connected-device sync.

## Children and education context

GradeLog is a general-purpose grade tracking tool. It is not a school-managed student information system, LMS, or classroom platform.

If you are using GradeLog in a school or university context, you are responsible for making sure your use of the app is appropriate for your own privacy needs and institutional requirements.

## Changes to this policy

This policy may be updated as GradeLog evolves, especially as sync, encryption, and account-management features change.

If the data model or privacy posture changes materially, this policy should be updated to reflect that.

## Contact

If you have privacy questions about GradeLog, use the project contact/support channel listed in the repository or product site.
