// Paste this file into a Framer Code Component. It is intentionally standalone.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const API = "https://syncsphere-hiv6.onrender.com"

export default function SkillpathCourses(props) {
    const { accent, heading } = props
    const [courses, setCourses] = React.useState([])
    const [country, setCountry] = React.useState(null)
    const [status, setStatus] = React.useState("loading")
    const [countryFailed, setCountryFailed] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [sort, setSort] = React.useState("default")
    const [attempt, setAttempt] = React.useState(0)

    React.useEffect(() => {
        const controller = new AbortController()
        setStatus("loading")
        setCountryFailed(false)
        Promise.allSettled([
            fetch(`${API}/assignment/course-data`, { method: "GET", signal: controller.signal }).then(r => {
                if (!r.ok) throw new Error(`Courses: ${r.status}`)
                return r.json()
            }),
            fetch(`${API}/assignment/country-code`, { method: "GET", signal: controller.signal }).then(r => {
                if (!r.ok) throw new Error(`Country: ${r.status}`)
                return r.json()
            }),
        ]).then(([courseResult, countryResult]) => {
            if (controller.signal.aborted) return
            if (courseResult.status === "rejected") {
                setCourses([])
                setStatus("error")
                return
            }
            setCourses(courseResult.value)
            setStatus(courseResult.value.length ? "ready" : "empty")
            if (countryResult.status === "fulfilled" && ["IN", "US"].includes(countryResult.value.country_code)) {
                setCountry(countryResult.value.country_code)
            } else {
                setCountry(null)
                setCountryFailed(true)
            }
        })
        return () => controller.abort()
    }, [attempt])

    const price = course => {
        if (!country) return "Unavailable"
        const amount = (country === "IN" ? course.pricePaise : course.priceUsdCents) / 100
        return new Intl.NumberFormat(country === "IN" ? "en-IN" : "en-US", {
            style: "currency", currency: country === "IN" ? "INR" : "USD",
            maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        }).format(amount)
    }

    const visible = React.useMemo(() => {
        const term = query.trim().toLowerCase()
        const next = courses.filter(c => !term || `${c.courseName} ${c.description} ${c.mainCategory}`.toLowerCase().includes(term))
        if (sort !== "default" && country) {
            const key = country === "IN" ? "pricePaise" : "priceUsdCents"
            next.sort((a,b) => sort === "low" ? a[key]-b[key] : b[key]-a[key])
        }
        return next
    }, [courses, query, sort, country])

    const retry = () => setAttempt(n => n + 1)
    return <section style={{ ...styles.section, "--accent": accent }}>
        <style>{css}</style>
        <div className="sp-head"><div><small>THE COURSE SHELF</small><h2>{heading}</h2></div><p>Focused courses for people who would rather build, practise and grow than watch from the sidelines.</p></div>
        <div className="sp-controls"><input aria-label="Search courses" placeholder="Search courses" value={query} onChange={e=>setQuery(e.target.value)} /><select aria-label="Sort courses" value={sort} disabled={!country} onChange={e=>setSort(e.target.value)}><option value="default">Featured order</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
        {countryFailed && status === "ready" && <div className="sp-notice">Prices are temporarily unavailable.<button onClick={retry}>Retry prices</button></div>}
        {status === "loading" && <div className="sp-grid" aria-busy="true">{[0,1,2,3,4,5].map(n=><div className="sp-card sp-skeleton" key={n}><i/><i/><i/></div>)}</div>}
        {status === "error" && <div className="sp-state"><h3>The shelf didn’t load this time.</h3><p>The connection can be temperamental.</p><button onClick={retry}>Try again</button></div>}
        {status === "empty" && <div className="sp-state"><h3>New courses are on the way.</h3><button onClick={retry}>Check again</button></div>}
        {status === "ready" && !visible.length && <div className="sp-state"><h3>No matching courses.</h3><p>Try a broader search.</p></div>}
        {status === "ready" && !!visible.length && <div className="sp-grid">{visible.map((c,i)=><article className="sp-card" key={c.mangoId || c.courseCode}><div className="sp-top"><span>{String(i+1).padStart(2,"0")}</span>{c.refundable && <b>Refundable</b>}</div><div><small>{c.mainCategory}</small><h3>{c.courseName}</h3><p>{c.description}</p></div><div className="sp-bottom"><div><span>Format</span><strong>{c.courseType}</strong></div><div><span>Price</span><strong>{price(c)}</strong></div></div></article>)}</div>}
    </section>
}

SkillpathCourses.defaultProps = { accent: "#D8FF52", heading: "Pick a path. Make it yours." }
addPropertyControls(SkillpathCourses, {
    accent: { type: ControlType.Color, title: "Accent" },
    heading: { type: ControlType.String, title: "Heading" },
})

const styles = { section: { width:"100%", padding:"clamp(56px,8vw,120px) clamp(18px,4vw,64px)", background:"#f3f0e8", color:"#161711", fontFamily:"Inter, Arial, sans-serif" } }
const css = `.sp-head{display:grid;grid-template-columns:1.6fr 1fr;align-items:end;gap:50px;max-width:1180px;margin:0 auto 44px}.sp-head small,.sp-card small{letter-spacing:1.5px;font-weight:800}.sp-head h2{font-size:clamp(48px,7vw,86px);line-height:.88;letter-spacing:-.06em;margin:16px 0 0}.sp-head p{color:#686a60;line-height:1.6}.sp-controls{display:flex;gap:12px;justify-content:space-between;max-width:1180px;margin:0 auto 22px}.sp-controls input,.sp-controls select{padding:14px;border:1px solid #d9d5ca;background:white;font:inherit}.sp-controls input{flex:1;max-width:480px}.sp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;max-width:1180px;margin:auto}.sp-card{min-height:390px;padding:22px;background:#fff;border:1px solid #d9d5ca;display:flex;flex-direction:column;justify-content:space-between}.sp-top,.sp-bottom,.sp-notice{display:flex;justify-content:space-between;gap:12px}.sp-top b{background:var(--accent);padding:7px 9px;border-radius:999px;font-size:10px;text-transform:uppercase}.sp-card small{color:#ff6a3d;font-size:10px}.sp-card h3{font-size:28px;line-height:1;margin:12px 0}.sp-card p{color:#686a60;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.sp-bottom{border-top:1px solid #e6e2d8;padding-top:18px}.sp-bottom div{display:flex;flex-direction:column;gap:6px}.sp-bottom div:last-child{text-align:right}.sp-bottom span{font-size:9px;text-transform:uppercase;color:#8b8d83}.sp-notice,.sp-state{max-width:1180px;margin:0 auto 20px;padding:18px;background:#fff;border:1px solid #d9d5ca}.sp-notice button,.sp-state button{background:var(--accent);border:0;padding:10px 14px;font-weight:800}.sp-state{text-align:center;padding:70px 24px}.sp-skeleton{justify-content:flex-start;gap:24px}.sp-skeleton i{height:20px;background:#ece9e0}.sp-skeleton i:nth-child(2){height:70px;margin-top:65px}.sp-skeleton i:last-child{margin-top:auto;height:50px}@media(max-width:900px){.sp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.sp-head{grid-template-columns:1fr}}@media(max-width:600px){.sp-grid{grid-template-columns:1fr}.sp-controls{flex-direction:column}.sp-controls input{max-width:none}.sp-card{min-height:350px}}`
