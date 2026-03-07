import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import JobCategorySelector from '../components/JobCategorySelector'
import type { JobCategory } from '../components/JobCategorySelector'
import '../styles/onboarding-page.css'

const jobCategories: JobCategory[] = [
  {
    id: 'b2c',
    label: 'B2C',
    description: '네이버, 카카오, 배달의민족 같은 대규모 사용자 서비스 플랫폼을 지향하는 유형입니다.',
  },
  {
    id: 'fintech',
    label: '금융 및 핀테크',
    description: '토스, 카카오뱅크, 은행권처럼 안정성과 데이터 정확성을 중심으로 제품을 만드는 유형입니다.',
  },
  {
    id: 'b2b',
    label: 'B2B',
    description: '엔터프라이즈·SaaS·협업 도구 등 기업 고객의 생산성을 높이는 솔루션을 만드는 유형입니다.',
  },
  {
    id: 'infra',
    label: 'Infra/DevOps',
    description: '인프라 자동화, 플랫폼 엔지니어링, 서버 운영과 개발 생산성 개선에 집중하는 유형입니다.',
  },
  {
    id: 'generalist',
    label: 'Generalist',
    description: '초기 스타트업에서 빠른 실행과 비즈니스 검증을 우선하며 넓은 역할을 담당하는 유형입니다.',
  },
]

function OnboardingPage() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [careerType, setCareerType] = useState<'none' | 'years'>('none')
  const [careerYears, setCareerYears] = useState('')
  const [targetCompany, setTargetCompany] = useState('')
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [portfolioError, setPortfolioError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(jobCategories[0].id)

  const handlePortfolioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null

    if (!selectedFile) {
      setPortfolioFile(null)
      setPortfolioError('')
      return
    }

    const isPdfFile = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')

    if (!isPdfFile) {
      setPortfolioFile(null)
      setPortfolioError('PDF 파일만 업로드할 수 있습니다.')
      event.target.value = ''
      return
    }

    setPortfolioFile(selectedFile)
    setPortfolioError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <main className="onboarding-page">
      <section className="login-card onboarding-card">
        <header className="onboarding-header">
          <p className="brand-pill">Career Setup</p>
          <h1>Roddy 온보딩</h1>
          <p className="onboarding-copy">당신의 목표를 입력하고 커리어 가이드를 시작하세요.</p>
        </header>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <label className="field-group">
            <span className="field-label">이름</span>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="이름을 입력해 주세요" required />
          </label>

          <label className="field-group">
            <span className="field-label">나이</span>
            <input
              type="number"
              min={0}
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="나이를 입력해 주세요"
              required
            />
          </label>

          <fieldset className="field-group">
            <legend className="field-label">경력</legend>
            <div className="career-controls">
              <label className={`career-toggle ${careerType === 'none' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="careerType"
                  value="none"
                  checked={careerType === 'none'}
                  onChange={() => {
                    setCareerType('none')
                    setCareerYears('')
                  }}
                />
                없음
              </label>
              <label className={`career-toggle ${careerType === 'years' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="careerType"
                  value="years"
                  checked={careerType === 'years'}
                  onChange={() => setCareerType('years')}
                />
                경력 n년
              </label>
            </div>
            <input
              type="number"
              min={0}
              value={careerYears}
              onChange={(event) => setCareerYears(event.target.value)}
              placeholder="예: 3"
              disabled={careerType !== 'years'}
            />
          </fieldset>

          <label className="field-group">
            <span className="field-label">희망 기업</span>
            <input
              type="text"
              value={targetCompany}
              onChange={(event) => setTargetCompany(event.target.value)}
              placeholder="예: 네이버, 토스, 채널톡"
              required
            />
          </label>

          <label className="field-group">
            <span className="field-label">포트폴리오 (PDF)</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handlePortfolioChange} />
            <span className="file-meta">
              {portfolioFile ? `${portfolioFile.name} (${Math.max(1, Math.round(portfolioFile.size / 1024))} KB)` : '선택된 파일 없음'}
            </span>
            {portfolioError && <span className="field-error">{portfolioError}</span>}
          </label>

          <fieldset className="field-group">
            <legend className="field-label">희망 직군 카테고리</legend>
            <JobCategorySelector
              categories={jobCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </fieldset>

          <button type="submit" className="start-button">
            Roddy 시작하기
          </button>
        </form>
      </section>
    </main>
  )
}

export default OnboardingPage
