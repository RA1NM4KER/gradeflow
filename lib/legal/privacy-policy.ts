import { LegalSection } from "@/lib/legal/legal-types";

export const privacyPolicyTitle = "Privacy Policy";
export const privacyPolicyLastUpdated = "April 3, 2026";
export const privacyPolicyIntro =
  "GradeLog is local-first by default. This page explains what stays on your device, what happens if you enable optional sync, and where the product is still headed.";

export const privacyPolicySections: LegalSection[] = [
  {
    title: "Overview",
    body: [
      "GradeLog is a local-first grade tracker.",
      "You do not need an account to use GradeLog locally. By default, your grades stay on your device.",
      "If you choose to connect your devices, GradeLog can sync your data across those devices using a remote service. That sync is optional.",
    ],
  },
  {
    title: "What GradeLog does by default",
    body: ["When you use GradeLog without connecting devices:"],
    bullets: [
      "your grade data is stored locally on your device",
      "the app works offline after it has been loaded",
      "no account is required",
      "backup export and import happen locally",
    ],
    footer:
      "In this mode, GradeLog does not require a cloud database to provide its core functionality.",
  },
  {
    title: "Optional connected devices",
    body: ["If you choose to connect your devices:"],
    bullets: [
      "you create or sign in to an account using email and password",
      "GradeLog stores sync data on a remote service so your devices can stay in sync",
      "your local device remains the primary working copy",
      "changes made offline can sync later when you reconnect",
    ],
    footer:
      "Connected-device sync is optional. You can disconnect at any time.",
  },
  {
    title: "Data we process",
    body: [
      "Depending on how you use GradeLog, the following data may be processed.",
    ],
  },
  {
    title: "Local app data",
    body: ["Stored on your device:"],
    bullets: [
      "semesters",
      "courses",
      "assignments and grouped categories",
      "grades, weightings, cutoffs, and related academic tracking data",
      "local app settings and sync metadata needed for the app to function",
    ],
  },
  {
    title: "Optional account and sync data",
    body: ["Stored remotely only if you choose to connect your devices:"],
    bullets: [
      "your email address",
      "authentication session data",
      "device identifiers used to keep your devices in sync",
      "synced academic data and sync operation records",
      "shared course setup records that you create",
    ],
  },
  {
    title: "Shared course links",
    body: [
      "GradeLog lets you create shareable course setup links so another person can add a copy of a course to their own semester.",
    ],
    bullets: [
      "anyone with the link can open the shared course setup",
      "importing from a shared link creates a separate copy and does not keep the imported course synced to the original",
      "shared course links are intended to share course structure, not your personal grades",
    ],
  },
  {
    title: "Current encryption status",
    body: [
      "GradeLog is built around a privacy-first product direction, but synced data is not yet end-to-end encrypted.",
      "Today, when connected-device sync is enabled, synced academic data is stored on a remote service in a form that may be readable by the service operator.",
      "The intended long-term standard for GradeLog is:",
    ],
    bullets: [
      "grades are end-to-end encrypted",
      "raw academic data is not readable by the server by default",
      "privacy is treated as a product constraint, not a later patch",
    ],
    footer:
      "Until that encryption model exists, you should assume that connected-device sync involves storing sync data remotely in a readable form.",
  },
  {
    title: "How your data is used",
    body: [
      "GradeLog uses data only to provide the product’s functionality, including:",
    ],
    bullets: [
      "storing and showing your grade data on your device",
      "calculating standings, averages, and grade thresholds",
      "restoring backups that you import",
      "authenticating you if you choose to connect your devices",
      "syncing changes between your devices when sync is enabled",
    ],
    footer:
      "GradeLog is not built around advertising, social sharing, or selling academic data.",
  },
  {
    title: "Third-party services",
    body: [
      "GradeLog currently uses Supabase for optional authentication and sync infrastructure.",
      "If you enable connected-device sync, relevant account and sync data is processed through that provider.",
    ],
  },
  {
    title: "Data sharing",
    body: [
      "GradeLog does not sell your data.",
      "When sync is disabled, your data is intended to remain on your device except where you explicitly export it.",
      "When sync is enabled, your data is shared with the sync infrastructure required to authenticate your account and keep your connected devices in sync.",
    ],
  },
  {
    title: "Retention",
    body: [
      "Local data remains on your device until you delete it, uninstall the app, clear browser or app storage, or replace it through import or restore.",
      "If you use optional sync, synced data may remain on the remote service until you disconnect, delete your cloud account, or it is otherwise removed through operational cleanup.",
      "Deleting your cloud account is intended to remove your remote account, synced cloud data, connected-device records, and shared course setup records tied to that account.",
      "Deleting your cloud account does not automatically erase local-only data already stored on a browser or device unless you separately clear that device.",
    ],
  },
  {
    title: "Your choices",
    body: ["You can choose to:"],
    bullets: [
      "use GradeLog entirely locally with no account",
      "export your local data",
      "import or replace local data manually",
      "connect your devices for optional sync",
      "disconnect sync later",
      "delete your cloud account and synced remote data if you no longer want connected-device features",
    ],
    footer:
      "If you prefer not to store academic data remotely, do not enable connected-device sync.",
  },
  {
    title: "Children and education context",
    body: [
      "GradeLog is a general-purpose grade tracking tool. It is not a school-managed student information system, LMS, or classroom platform.",
      "If you are using GradeLog in a school or university context, you are responsible for making sure your use of the app is appropriate for your own privacy needs and institutional requirements.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "This policy may be updated as GradeLog evolves, especially as sync, encryption, and account-management features change.",
      "If the data model or privacy posture changes materially, this policy should be updated to reflect that.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If you have privacy questions about GradeLog, use the project contact or support channel listed in the repository or product site.",
    ],
  },
];
