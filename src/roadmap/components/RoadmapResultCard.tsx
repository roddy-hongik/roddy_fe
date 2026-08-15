import type { GeneratedRoadmap } from '../../api/types/roadmap'

type RoadmapResultCardProps = {
  roadmap: GeneratedRoadmap
}

function RoadmapResultCard({ roadmap }: RoadmapResultCardProps) {
  return (
    <section className="roadmap-result-card glass-style" aria-label="생성된 로드맵">
      <h2>생성 결과</h2>
      <h3>{roadmap.title}</h3>
      <ol className="roadmap-stepper">
        {roadmap.steps.map((step) => (
          <li key={step.stage} className="roadmap-step-item">
            <p className="roadmap-step-stage">{step.stage}</p>
            <p className="roadmap-step-goal">학습 목표: {step.goal}</p>
            <p className="roadmap-step-label">학습 주제</p>
            <ul>
              {step.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <p className="roadmap-step-label">추천 실습/결과물</p>
            <ul>
              {step.outputs.map((output) => (
                <li key={output}>{output}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default RoadmapResultCard
