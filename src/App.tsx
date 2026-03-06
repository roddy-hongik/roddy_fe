import './App.css'

function App() {
  const cards = [
    {
      title: '빠른 시작',
      description: '필요한 핵심 기능만 먼저 만들고, 나중에 천천히 확장해요.',
    },
    {
      title: '깔끔한 구조',
      description: '복잡한 폴더 분리 없이 한눈에 보이는 단순한 화면 구성이에요.',
    },
    {
      title: '쉬운 수정',
      description: '텍스트와 스타일을 바꾸기 쉬워서 초보자에게도 부담이 적어요.',
    },
  ]

  return (
    <div className="landing">
      <header className="hero">
        <p className="badge">My First Landing</p>
        <h1>간단하고 명확한 랜딩페이지</h1>
        <p className="intro">
          Vite + React + TypeScript로 만든 첫 화면입니다. 필요한 요소만 넣어 쉽게
          시작해보세요.
        </p>
        <div className="actions">
          <button className="btn primary">시작하기</button>
          <button className="btn secondary">자세히 보기</button>
        </div>
      </header>

      <section className="card-list">
        {cards.map((card) => (
          <article key={card.title} className="feature-card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default App
