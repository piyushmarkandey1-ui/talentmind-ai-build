import { Logo } from './logo'

const groups = [
  {
    title: 'Product',
    links: ['Overview', 'How it works', 'Evaluation', 'Pricing'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'DPA'],
  },
]

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-12 pt-8">
      <div className="glass rounded-4xl p-8 sm:p-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The AI hiring operating system. Final hiring decisions always
              remain with the recruiter.
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-sm font-semibold text-foreground">
                {g.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {g.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TalentMind AI. All rights reserved.</p>
          <p>Built with Google Gemini.</p>
        </div>
      </div>
    </footer>
  )
}
