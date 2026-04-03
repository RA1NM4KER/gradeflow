import Link from "next/link";

const sections = [
  {
    title: "Overview",
    body: [
      "These Terms of Service govern your use of GradeLog.",
      "GradeLog is a local-first grade tracker. It is designed to help you track courses, assignments, grouped categories, and grades on your own device, with optional connected-device sync.",
      "By using GradeLog, you agree to these terms.",
    ],
  },
  {
    title: "What GradeLog is",
    body: ["GradeLog is a personal productivity tool for academic tracking."],
    bullets: [
      "a school or university information system",
      "an official grade reporting platform",
      "a learning management system",
      "a substitute for checking official academic records",
    ],
    footer:
      "You are responsible for verifying important academic information against your official records where needed.",
    negativeList: true,
  },
  {
    title: "Eligibility and responsibility",
    body: [
      "You are responsible for your use of GradeLog and for any data you enter into it.",
      "If you use GradeLog in connection with a school, university, or other institution, you are responsible for ensuring that your use is appropriate under that institution’s rules and your own privacy requirements.",
    ],
  },
  {
    title: "Local-first use",
    body: ["GradeLog can be used without an account.", "When used locally:"],
    bullets: [
      "your data is stored on your device",
      "the app may continue to work offline after it has been loaded",
      "backup export and import are your responsibility",
    ],
    footer:
      "You are responsible for maintaining your own backups if you care about preserving your data.",
  },
  {
    title: "Optional connected devices",
    body: ["If you choose to connect your devices:"],
    bullets: [
      "you may create an account using email and password",
      "GradeLog may store sync-related data on a remote service",
      "sync is provided to help keep your devices aligned, but local data remains your primary working copy",
    ],
    footer:
      "Connected-device sync is optional. You can stop using it at any time.",
  },
  {
    title: "Current sync limitations",
    body: ["Connected-device sync is still evolving.", "At this stage:"],
    bullets: [
      "synced data is not yet end-to-end encrypted",
      "sync behavior may continue to change as the product matures",
      "conflict handling is designed to be practical, but not every edge case will have a dedicated user-facing workflow",
    ],
    footer:
      "GradeLog is provided on an evolving basis, and you should not assume that sync is perfect, uninterrupted, or suitable for high-stakes institutional workflows.",
  },
  {
    title: "Acceptable use",
    body: ["You agree not to:"],
    bullets: [
      "use GradeLog for unlawful purposes",
      "attempt to interfere with or disrupt the service or infrastructure",
      "attempt to gain unauthorized access to other users’ data or accounts",
      "misuse the optional sync or authentication features",
    ],
  },
  {
    title: "Intellectual property",
    body: [
      "GradeLog, including its design, code, branding, and product content, remains the property of its owner or contributors except where otherwise stated.",
      "These terms do not transfer ownership of the product or its intellectual property to you.",
    ],
  },
  {
    title: "No guarantee of continuous availability",
    body: [
      "GradeLog is provided on an “as is” and “as available” basis.",
      "The app may change, improve, break, or be discontinued over time. Features may be added, removed, or revised without notice.",
      "This is especially true for optional sync and account-related features, which are newer and more operationally dependent than local-only usage.",
    ],
  },
  {
    title: "Backups, data loss, and accuracy",
    body: ["You are responsible for:"],
    bullets: [
      "the accuracy of the data you enter",
      "keeping backups where needed",
      "checking official academic records when accuracy matters",
    ],
    footer:
      "To the extent permitted by law, GradeLog is not responsible for loss of data, grade miscalculations caused by incorrect input, missed deadlines, or decisions made based on app data.",
  },
  {
    title: "Privacy",
    body: [
      "Your use of GradeLog is also governed by the Privacy Policy.",
      "If there is a conflict between how data practices are described in product messaging and in the Privacy Policy, the Privacy Policy should control for data-handling questions.",
    ],
  },
  {
    title: "Changes to these terms",
    body: [
      "These terms may be updated as GradeLog evolves.",
      "If the product changes materially, these terms may also be revised to reflect the new product shape.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If you have questions about these terms, use the project contact or support channel listed in the repository or product site.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-14">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          GradeLog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2.2rem]">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft sm:text-[0.98rem]">
          Last updated: April 3, 2026
        </p>
        <p className="mt-4 text-sm leading-6 text-ink-soft sm:text-[0.98rem]">
          These terms describe how GradeLog is offered today: local-first by
          default, optional sync if you choose it, and no promise that this is a
          school-managed system.
        </p>
      </div>

      <div className="mt-10 grid gap-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              {section.title}
            </h2>
            <div className="mt-3 grid gap-3 text-sm leading-6 text-ink-soft sm:text-[0.98rem]">
              {section.body?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="grid gap-1.5 pl-5">
                  {section.bullets.map((item) => (
                    <li key={item} className="list-disc">
                      {section.negativeList ? `not ${item}` : item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.footer ? <p>{section.footer}</p> : null}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12">
        <Link
          className="inline-flex items-center rounded-full border border-white/28 bg-white/62 px-4 py-2 text-sm font-medium text-foreground shadow-[0_10px_24px_-18px_rgba(15,23,42,0.18)] backdrop-blur-sm transition hover:bg-white/82 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14"
          href="/"
          prefetch={false}
        >
          Back to GradeLog
        </Link>
      </div>
    </div>
  );
}
