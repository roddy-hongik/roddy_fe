type TechStackSectionProps = {
  title: string
  stacks: string[]
}

function TechStackSection({ title, stacks }: TechStackSectionProps) {
  return (
    <section className="report-section glass-style">
      <div className="report-section-title">
        <h2>{title}</h2>
      </div>
      <div className="report-chip-wrap">
        {stacks.map((stack) => (
          <span key={stack} className="report-chip">
            {stack}
          </span>
        ))}
      </div>
    </section>
  )
}

export default TechStackSection
