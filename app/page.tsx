import { CoursesSection } from "./CoursesSection";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <nav className="nav shell" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Skillpath home">skillpath<span>.</span></a>
          <a className="navLink" href="#courses">Browse courses</a>
        </nav>
        <div className="heroContent shell" id="top">
          <p className="eyebrow">Learn what moves you forward</p>
          <h1>Practical skills.<br /><em>Real momentum.</em></h1>
          <p className="heroCopy">Focused courses for ambitious people who would rather build, practise and grow than watch from the sidelines.</p>
          <a className="primaryButton" href="#courses">Explore courses <span>↘</span></a>
        </div>
        <div className="marquee" aria-hidden="true">
          <div>LEARN · BUILD · SHIP · GROW · LEARN · BUILD · SHIP · GROW ·</div>
        </div>
      </section>

      <CoursesSection />

      <footer className="footer">
        <div className="shell footerInner">
          <a className="brand footerBrand" href="#top">skillpath<span>.</span></a>
          <div className="footerLinks">
            <a href="#courses">Courses</a>
            <a href="#about">About</a>
            <a href="mailto:hello@skillpath.example">Contact</a>
          </div>
          <p>© 2026 Skillpath. Built for curious minds.</p>
        </div>
      </footer>
    </main>
  );
}
