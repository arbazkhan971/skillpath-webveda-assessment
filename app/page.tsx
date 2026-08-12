import { CoursesSection } from "./CoursesSection";

const principles = [
  {
    number: "01",
    title: "Useful over endless",
    copy: "Short, focused courses that end with something made—not another forgotten playlist.",
  },
  {
    number: "02",
    title: "Honest by default",
    copy: "Live regional pricing when it is available, and a clear recovery path when it is not.",
  },
  {
    number: "03",
    title: "Ready for real life",
    copy: "Searchable, responsive and resilient across unreliable networks and smaller screens.",
  },
];

const compilerStages = [
  { label: "Input", value: "I want to move forward" },
  { label: "Resolve", value: "GET /assignment/course-data" },
  { label: "Localize", value: "country_code → INR / USD" },
  { label: "Practise", value: "Useful work, not passive watching" },
  { label: "Output", value: "Visible proof of progress" },
];

export default function Home() {
  return (
    <main>
      <a className="skipLink" href="#courses">Skip to courses</a>

      <section className="hero" id="top" aria-labelledby="hero-heading">
        <nav className="nav shell" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Skillpath home">skillpath<span>.</span></a>
          <div className="navLinks">
            <a href="#about">Why Skillpath</a>
            <a className="navLink" href="#courses">Browse courses</a>
          </div>
        </nav>

        <div className="heroContent shell">
          <div>
            <p className="eyebrow">Learn what moves you forward</p>
            <h1 id="hero-heading">Practical skills.<br /><em>Real momentum.</em></h1>
            <p className="heroCopy">Focused courses for ambitious people who would rather build, practise and grow than watch from the sidelines.</p>
            <a className="primaryButton" href="#courses">Explore live courses <span aria-hidden="true">↘</span></a>
          </div>

          <aside className="compiler" aria-label="How Skillpath turns intent into progress">
            <header className="compilerHeader">
              <span>Skillpath compiler</span>
              <span>Build 01</span>
            </header>
            <ol className="compilerTrace">
              {compilerStages.map((stage, index) => (
                <li className="compilerStep" key={stage.label}>
                  <span className="compilerIndex" aria-hidden="true">0{index + 1}</span>
                  <div>
                    <span className="compilerLabel">{stage.label}</span>
                    <strong>{stage.value}</strong>
                  </div>
                </li>
              ))}
            </ol>
            <p className="compilerStatus"><span aria-hidden="true" />Build passed · Momentum +1</p>
          </aside>
        </div>

        <div className="marquee" aria-hidden="true">
          <div>LEARN · BUILD · SHIP · GROW · LEARN · BUILD · SHIP · GROW ·</div>
        </div>
      </section>

      <section className="principles" id="about" aria-labelledby="principles-heading">
        <div className="shell principlesIntro">
          <p className="eyebrow">Why Skillpath</p>
          <h2 id="principles-heading">Learning designed for the messy middle.</h2>
          <p>Between knowing what you want and knowing how to do it, you need a clear next step. That is what this shelf is for.</p>
        </div>
        <div className="shell principlesGrid">
          {principles.map((principle) => (
            <article key={principle.number}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <CoursesSection />

      <footer className="footer">
        <div className="shell footerInner">
          <div>
            <a className="brand footerBrand" href="#top">skillpath<span>.</span></a>
            <p className="footerTagline">Practical learning for people in motion.</p>
          </div>
          <div className="footerLinks" aria-label="Footer navigation">
            <a href="#courses">Courses</a>
            <a href="#about">About</a>
            <a href="mailto:arbazkhan971@gmail.com">Contact</a>
          </div>
          <p className="footerLegal">© 2026 Skillpath. Built for curious minds.</p>
        </div>
      </footer>
    </main>
  );
}
