// Standalone Framer Code Component. Paste this file into Framer as-is.
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const API_BASE = "https://syncsphere-hiv6.onrender.com"
const REQUEST_TIMEOUT_MS = 8000

type Country = "IN" | "US"
type SortOrder = "default" | "low" | "high"
type ResourceState = "loading" | "error" | "ready"

type Course = {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    courseType: string
    pricePaise: number
    priceUsdCents: number
    mangoId: string
    refundable: boolean
}

type SkillpathProps = {
    accent: string
    heading: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null
}

function isCourse(value: unknown): value is Course {
    if (!isRecord(value)) return false
    const strings = [
        value.courseName,
        value.courseCode,
        value.description,
        value.mainCategory,
        value.courseType,
        value.mangoId,
    ]
    return (
        strings.every((field) => typeof field === "string" && field.trim().length > 0) &&
        typeof value.pricePaise === "number" &&
        Number.isFinite(value.pricePaise) &&
        value.pricePaise >= 0 &&
        typeof value.priceUsdCents === "number" &&
        Number.isFinite(value.priceUsdCents) &&
        value.priceUsdCents >= 0 &&
        typeof value.refundable === "boolean"
    )
}

function parseCourses(payload: unknown): Course[] {
    if (!Array.isArray(payload)) throw new Error("Courses payload is not an array")
    const validCourses = payload.filter(isCourse)
    if (payload.length > 0 && validCourses.length === 0) {
        throw new Error("Courses payload contains no valid records")
    }
    return validCourses
}

function parseCountry(payload: unknown): Country {
    if (!isRecord(payload) || (payload.country_code !== "IN" && payload.country_code !== "US")) {
        throw new Error("Unsupported pricing region")
    }
    return payload.country_code
}

async function requestJson<T>(
    path: string,
    signal: AbortSignal,
    parse: (payload: unknown) => T,
): Promise<T> {
    const requestController = new AbortController()
    const abortRequest = () => requestController.abort()
    const timeout = window.setTimeout(abortRequest, REQUEST_TIMEOUT_MS)
    signal.addEventListener("abort", abortRequest, { once: true })

    try {
        const response = await fetch(`${API_BASE}${path}`, {
            method: "GET",
            signal: requestController.signal,
            headers: { Accept: "application/json" },
        })
        if (!response.ok) throw new Error(`Request failed (${response.status})`)
        return parse(await response.json())
    } finally {
        window.clearTimeout(timeout)
        signal.removeEventListener("abort", abortRequest)
    }
}

function formatPrice(course: Course, country: Country | null): string | null {
    if (!country) return null
    const minorUnits = country === "IN" ? course.pricePaise : course.priceUsdCents
    return new Intl.NumberFormat(country === "IN" ? "en-IN" : "en-US", {
        style: "currency",
        currency: country === "IN" ? "INR" : "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(minorUnits / 100)
}

export default function SkillpathCourses(props: SkillpathProps) {
    const { accent, heading } = props
    const sectionRef = React.useRef<HTMLElement | null>(null)
    const searchId = React.useId()
    const sortId = React.useId()
    const [containerWidth, setContainerWidth] = React.useState(1200)
    const [courses, setCourses] = React.useState<Course[]>([])
    const [country, setCountry] = React.useState<Country | null>(null)
    const [courseState, setCourseState] = React.useState<ResourceState | "empty">("loading")
    const [countryState, setCountryState] = React.useState<ResourceState>("loading")
    const [query, setQuery] = React.useState("")
    const [sort, setSort] = React.useState<SortOrder>("default")
    const [courseAttempt, setCourseAttempt] = React.useState(0)
    const [countryAttempt, setCountryAttempt] = React.useState(0)
    const retryCourses = React.useCallback(() => {
        setCourseState("loading")
        setCourseAttempt((attempt) => attempt + 1)
    }, [])
    const retryCountry = React.useCallback(() => {
        setCountry(null)
        setCountryState("loading")
        setSort("default")
        setCountryAttempt((attempt) => attempt + 1)
    }, [])

    React.useEffect(() => {
        const element = sectionRef.current
        if (!element) return

        const updateWidth = (width: number) => {
            if (width > 0) React.startTransition(() => setContainerWidth(width))
        }
        updateWidth(element.getBoundingClientRect().width)
        if (typeof ResizeObserver === "undefined") return

        const observer = new ResizeObserver(([entry]) => updateWidth(entry?.contentRect.width ?? 0))
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

    React.useEffect(() => {
        const controller = new AbortController()
        requestJson("/assignment/course-data", controller.signal, parseCourses)
            .then((nextCourses) => {
                if (controller.signal.aborted) return
                setCourses(nextCourses)
                setCourseState(nextCourses.length ? "ready" : "empty")
            })
            .catch(() => {
                if (controller.signal.aborted) return
                setCourses([])
                setCourseState("error")
            })
        return () => controller.abort()
    }, [courseAttempt])

    React.useEffect(() => {
        const controller = new AbortController()
        requestJson("/assignment/country-code", controller.signal, parseCountry)
            .then((nextCountry) => {
                if (controller.signal.aborted) return
                setCountry(nextCountry)
                setCountryState("ready")
            })
            .catch(() => {
                if (controller.signal.aborted) return
                setCountry(null)
                setCountryState("error")
                setSort("default")
            })
        return () => controller.abort()
    }, [countryAttempt])

    const visibleCourses = React.useMemo(() => {
        const term = query.trim().toLocaleLowerCase()
        const filtered = courses.filter((course) => {
            if (!term) return true
            return [course.courseName, course.description, course.mainCategory, course.courseType]
                .some((field) => field.toLocaleLowerCase().includes(term))
        })
        if (sort === "default" || !country) return filtered
        const priceKey = country === "IN" ? "pricePaise" : "priceUsdCents"
        return [...filtered].sort((left, right) =>
            sort === "low" ? left[priceKey] - right[priceKey] : right[priceKey] - left[priceKey],
        )
    }, [courses, country, query, sort])

    const layout = containerWidth >= 1024 ? "desktop" : containerWidth >= 720 ? "tablet" : "phone"
    const columns = layout === "desktop" ? 3 : layout === "tablet" ? 2 : 1
    const regionLabel = country === "IN" ? "India · INR" : country === "US" ? "United States · USD" : "Pricing unavailable"
    const resultLabel = query.trim()
        ? `${visibleCourses.length} of ${courses.length} match “${query.trim()}”`
        : `${visibleCourses.length} ${visibleCourses.length === 1 ? "course" : "courses"} available`

    return (
        <section
            ref={sectionRef}
            className={`sp-root sp-${layout}`}
            style={{ ...styles.section, "--accent": accent } as React.CSSProperties}
            aria-labelledby="sp-heading"
        >
            <style>{css}</style>

            <div className="sp-head">
                <div><small>THE COURSE SHELF</small><h2 id="sp-heading">{heading}</h2></div>
                <p>Short on theory, rich in useful practice. Every course should help you make something real.</p>
            </div>

            {courseState === "ready" && (
                <>
                    <div className="sp-controls" aria-label="Course filters">
                        <div className="sp-search">
                            <label className="sp-sr" htmlFor={searchId}>Search courses</label>
                            <span aria-hidden="true">⌕</span>
                            <input id={searchId} type="search" placeholder="Search by name, topic or format" value={query} onChange={(event) => setQuery(event.target.value)} />
                            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear course search">Clear</button>}
                        </div>
                        <div className="sp-sort">
                            <label htmlFor={sortId}>Sort by price</label>
                            <select id={sortId} value={sort} disabled={countryState !== "ready"} onChange={(event) => setSort(event.target.value as SortOrder)}>
                                <option value="default">Featured order</option>
                                <option value="low">Low to high</option>
                                <option value="high">High to low</option>
                            </select>
                        </div>
                    </div>
                    <div className="sp-meta">
                        <p aria-live="polite">{resultLabel}</p>
                        <p className={`sp-region sp-region-${countryState}`}><i aria-hidden="true" />{countryState === "loading" ? "Detecting pricing region" : regionLabel}</p>
                    </div>
                </>
            )}

            {countryState === "error" && courseState === "ready" && (
                <div className="sp-notice" role="status">
                    <div><strong>Course details are ready; pricing is not.</strong><span>We never guess a currency when the region request fails.</span></div>
                    <button type="button" onClick={retryCountry}>Retry pricing only</button>
                </div>
            )}

            {courseState === "loading" && (
                <div className="sp-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-label="Loading courses" aria-busy="true">
                    {Array.from({ length: columns * 2 }, (_, index) => <div className="sp-card sp-skeleton" aria-hidden="true" key={index}><i /><i /><i /></div>)}
                </div>
            )}

            {courseState === "error" && (
                <div className="sp-state" role="alert"><small>RECOVERY STATE</small><h3>The shelf did not load this time.</h3><p>The API is intentionally unreliable, so this screen is a recovery path—not a dead end.</p><button type="button" onClick={retryCourses}>Retry courses</button></div>
            )}

            {courseState === "empty" && (
                <div className="sp-state" role="status"><small>ZERO-DATA STATE</small><h3>New courses are on the way.</h3><p>The request worked, but the shelf is empty right now.</p><button type="button" onClick={retryCourses}>Check again</button></div>
            )}

            {courseState === "ready" && visibleCourses.length === 0 && (
                <div className="sp-state" role="status"><small>NO SEARCH RESULTS</small><h3>Nothing matched “{query.trim()}”.</h3><p>Try a topic, format, or shorter phrase.</p><button type="button" onClick={() => setQuery("")}>Clear search</button></div>
            )}

            {courseState === "ready" && visibleCourses.length > 0 && (
                <div className="sp-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                    {visibleCourses.map((course, index) => (
                        <article className="sp-card" key={course.mangoId || course.courseCode}>
                            <div className="sp-top"><span>{String(index + 1).padStart(2, "0")}</span>{course.refundable && <b>Refundable</b>}</div>
                            <div><small>{course.mainCategory}</small><h3>{course.courseName}</h3><p>{course.description}</p></div>
                            <div className="sp-bottom">
                                <div><span>Format</span><strong>{course.courseType}</strong></div>
                                <div><span>Code</span><strong>{course.courseCode}</strong></div>
                                <div><span>Price</span><strong>{countryState === "loading" ? "Checking…" : formatPrice(course, country) ?? "Unavailable"}</strong></div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

SkillpathCourses.defaultProps = {
    accent: "#D8FF52",
    heading: "Pick a path. Make it yours.",
}

addPropertyControls(SkillpathCourses, {
    accent: { type: ControlType.Color, title: "Accent" },
    heading: { type: ControlType.String, title: "Heading" },
})

const styles = {
    section: {
        width: "100%",
        padding: "clamp(64px, 8vw, 120px) clamp(18px, 4vw, 64px)",
        background: "#f3f0e8",
        color: "#161711",
        fontFamily: "Inter, Arial, sans-serif",
    },
}

const css = `
.sp-root *{box-sizing:border-box}.sp-head{display:grid;grid-template-columns:1.6fr 1fr;align-items:end;gap:50px;max-width:1180px;margin:0 auto 44px}.sp-head small,.sp-card small,.sp-state small{letter-spacing:1.5px;font-weight:800}.sp-head h2{font-size:clamp(48px,7vw,86px);line-height:.88;letter-spacing:-.06em;margin:16px 0 0}.sp-head>p{color:#686a60;line-height:1.65;margin:0}.sp-controls{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;max-width:1180px;margin:0 auto 12px}.sp-search,.sp-sort{min-height:52px;display:flex;align-items:center;background:#fff;border:1px solid #d9d5ca}.sp-search{gap:10px;padding:0 14px;max-width:600px}.sp-search input{width:100%;border:0;outline:0;padding:14px 0;background:transparent;font:inherit}.sp-search input::-webkit-search-cancel-button{display:none}.sp-search button{border:0;border-bottom:1px solid currentColor;background:transparent;padding:2px 0;font-size:11px;cursor:pointer}.sp-sort label{padding-left:14px;color:#686a60;font-size:10px;text-transform:uppercase;letter-spacing:.8px;font-weight:700}.sp-sort select{height:100%;border:0;background:transparent;padding:0 34px 0 12px;font:inherit}.sp-meta{max-width:1180px;margin:0 auto 20px;display:flex;align-items:center;justify-content:space-between;gap:20px;color:#686a60;font-size:11px}.sp-meta p{margin:0}.sp-region{display:flex;align-items:center;gap:8px}.sp-region i{width:7px;height:7px;border-radius:50%;background:#ff6a3d}.sp-region-ready i{background:#5c9f44;box-shadow:0 0 0 3px #5c9f4426}.sp-grid{display:grid;gap:18px;max-width:1180px;margin:auto}.sp-card{min-height:405px;padding:22px;background:#fff;border:1px solid #d9d5ca;display:flex;flex-direction:column;justify-content:space-between}.sp-top,.sp-bottom,.sp-notice{display:flex;justify-content:space-between;gap:12px}.sp-top>span{font-family:monospace;color:#8b8d83}.sp-top b{background:var(--accent);padding:7px 9px;border-radius:999px;font-size:9px;text-transform:uppercase;letter-spacing:.8px}.sp-card small,.sp-state small{color:#ff6a3d;font-size:10px}.sp-card h3{font-size:28px;line-height:1;letter-spacing:-1px;margin:12px 0 15px}.sp-card p{color:#686a60;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.sp-bottom{border-top:1px solid #e6e2d8;padding-top:18px}.sp-bottom div{min-width:0;display:flex;flex-direction:column;gap:6px}.sp-bottom div:last-child{margin-left:auto;text-align:right}.sp-bottom span{font-size:8px;text-transform:uppercase;letter-spacing:.7px;color:#8b8d83}.sp-bottom strong{max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px}.sp-notice{max-width:1180px;margin:0 auto 20px;align-items:center;padding:17px 18px;background:#fff2c5;border:1px solid #d6bd64}.sp-notice>div{display:grid;gap:4px}.sp-notice span{color:#6b5b27;font-size:11px}.sp-notice button,.sp-state button{background:var(--accent);border:1px solid #161711;padding:10px 14px;font-weight:800;cursor:pointer}.sp-state{max-width:1180px;margin:0 auto;text-align:center;padding:75px 24px;background:#fff;border:1px solid #d9d5ca}.sp-state h3{font-size:clamp(28px,4vw,42px);letter-spacing:-1.5px;margin:10px 0}.sp-state p{max-width:520px;margin:0 auto 22px;color:#686a60;line-height:1.5}.sp-skeleton{justify-content:flex-start;gap:24px}.sp-skeleton i{height:20px;background:linear-gradient(90deg,#ece9e0 25%,#faf8f2 50%,#ece9e0 75%);background-size:200% 100%;animation:sp-pulse 1.3s infinite}.sp-skeleton i:nth-child(2){height:70px;margin-top:65px}.sp-skeleton i:last-child{margin-top:auto;height:50px}.sp-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.sp-tablet .sp-head,.sp-phone .sp-head{grid-template-columns:1fr}.sp-phone .sp-controls{grid-template-columns:1fr}.sp-phone .sp-search{max-width:none}.sp-phone .sp-sort{justify-content:space-between}.sp-phone .sp-meta,.sp-phone .sp-notice{align-items:flex-start;flex-direction:column}.sp-phone .sp-card{min-height:370px}@keyframes sp-pulse{to{background-position:-200% 0}}@media(prefers-reduced-motion:reduce){.sp-skeleton i{animation:none}}
`
