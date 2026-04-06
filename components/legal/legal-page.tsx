import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/ui/page-intro";
import { LegalSection } from "@/lib/legal/legal-types";

export function LegalPage({
  intro,
  lastUpdated,
  sections,
  title,
}: {
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  title: string;
}) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-14">
      <PageIntro
        badge="GradeLog"
        description={
          <>
            <p>Last updated: {lastUpdated}</p>
            <p className="mt-1">{intro}</p>
          </>
        }
        title={title}
      />

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
        <Button asChild size="pill" variant="glass">
          <Link href="/" prefetch={false}>
            Back to GradeLog
          </Link>
        </Button>
      </div>
    </div>
  );
}
