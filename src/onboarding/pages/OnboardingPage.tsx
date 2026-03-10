import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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

const companiesByCategory: Record<string, string[]> = {
  b2c: ['네이버', '카카오', '배달의민족', '당근', '쿠팡'],
  fintech: ['토스', '카카오뱅크', '신한은행', '국민은행', '하나은행'],
  b2b: ['채널톡', '토스페이먼츠', '센드버드', '리멤버앤컴퍼니', '스윗'],
  infra: ['네이버클라우드', '카카오엔터프라이즈', 'AWS 코리아', 'NHN Cloud', '메가존클라우드'],
  generalist: ['마켓컬리', '직방', '오늘의집', '강남언니', '리디'],
}

function OnboardingPage() {
  const navigate = useNavigate()
  const [reportTitle, setReportTitle] = useState(localStorage.getItem('pendingReportTitle') ?? '')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [careerType, setCareerType] = useState<'none' | 'years'>('none')
  const [careerYears, setCareerYears] = useState('')
  const [companyQuery, setCompanyQuery] = useState('')
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [companyError, setCompanyError] = useState('')
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [portfolioError, setPortfolioError] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categoryError, setCategoryError] = useState('')

  const availableCompanies = useMemo(() => {
    const merged = selectedCategories.flatMap((categoryId) => companiesByCategory[categoryId] ?? [])
    return Array.from(new Set(merged))
  }, [selectedCategories])

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = companyQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return availableCompanies
    }

    return availableCompanies.filter((company) => company.toLowerCase().includes(normalizedQuery))
  }, [availableCompanies, companyQuery])

  useEffect(() => {
    if (selectedCompanies.length === 0) {
      return
    }

    const nextSelectedCompanies = selectedCompanies.filter((company) => availableCompanies.includes(company))

    if (nextSelectedCompanies.length !== selectedCompanies.length) {
      setSelectedCompanies(nextSelectedCompanies)
      if (nextSelectedCompanies.length === 0) {
        setCompanyQuery('')
      }
    }
  }, [availableCompanies, selectedCompanies])

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
    setCategoryError('')
    setCompanyError('')

    if (selectedCategories.length === 0) {
      setCategoryError('희망 직군 카테고리는 필수 입력입니다.')
      return
    }

    if (careerType === 'years' && careerYears.trim() === '') {
      return
    }

    if (selectedCompanies.length === 0) {
      setCompanyError('선호 기업은 최소 1개 이상 선택해 주세요.')
      return
    }

    localStorage.setItem('pendingReportTitle', reportTitle.trim())
    localStorage.setItem('userPreferredCompanies', selectedCompanies.join(', '))
    navigate('/onboarding/github')
  }

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((current) => {
      if (current.includes(categoryId)) {
        setCategoryError('')
        return current.filter((id) => id !== categoryId)
      }

      if (current.length >= 2) {
        setCategoryError('희망 직군 카테고리는 최대 2개까지 선택할 수 있습니다.')
        return current
      }

      setCategoryError('')
      return [...current, categoryId]
    })
  }

  const handleToggleCompany = (company: string) => {
    setSelectedCompanies((current) => {
      if (current.includes(company)) {
        setCompanyError('')
        return current.filter((item) => item !== company)
      }

      if (current.length >= 5) {
        setCompanyError('선호 기업은 최대 5개까지 선택할 수 있습니다.')
        return current
      }

      setCompanyError('')
      return [...current, company]
    })
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
          <label className="field-group full-width">
            <span className="field-label">리포트 제목</span>
            <input
              type="text"
              value={reportTitle}
              onChange={(event) => setReportTitle(event.target.value)}
              placeholder="예: 2026 상반기 백엔드 분석 리포트"
              required
            />
            <span className="field-meta">분석 결과 리포트에 표시될 제목입니다.</span>
          </label>

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
                신입
              </label>
              <div className={`career-experience ${careerType === 'years' ? 'active' : ''}`}>
                <label className={`career-toggle ${careerType === 'years' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="careerType"
                    value="years"
                    checked={careerType === 'years'}
                    onChange={() => setCareerType('years')}
                  />
                  경력
                </label>
                {careerType === 'years' && (
                  <>
                    <input
                      type="number"
                      min={0}
                      value={careerYears}
                      onChange={(event) => setCareerYears(event.target.value)}
                      className="career-year-input"
                      placeholder="3"
                      required={careerType === 'years'}
                    />
                    <span className="career-year-unit">년</span>
                  </>
                )}
              </div>
            </div>
          </fieldset>

          <fieldset className="field-group full-width">
            <legend className="field-label">희망 직군 카테고리</legend>
            <JobCategorySelector
              categories={jobCategories}
              selectedCategories={selectedCategories}
              onToggleCategory={handleToggleCategory}
            />
            <span className="field-meta">최대 2개까지 선택 가능</span>
            {categoryError && <span className="field-error">{categoryError}</span>}
          </fieldset>

          <fieldset className="field-group full-width">
            <legend className="field-label">희망 기업</legend>
            <div className="company-search-wrap">
              <input
                type="text"
                value={companyQuery}
                onChange={(event) => {
                  setCompanyQuery(event.target.value)
                  setCompanyError('')
                }}
                placeholder={
                  selectedCategories.length === 0
                    ? '먼저 희망 직무 카테고리를 선택해 주세요'
                    : '기업명을 검색해 주세요'
                }
                disabled={selectedCategories.length === 0}
              />

              <div className="company-option-list" role="listbox" aria-label="희망 기업 검색 결과">
                {selectedCategories.length === 0 && <p className="company-option-empty">직군 카테고리를 먼저 선택해 주세요.</p>}
                {selectedCategories.length > 0 && filteredCompanies.length === 0 && (
                  <p className="company-option-empty">검색 결과가 없습니다.</p>
                )}
                {selectedCategories.length > 0 &&
                  filteredCompanies.map((company) => (
                    <button
                      key={company}
                      type="button"
                      className={`company-option ${selectedCompanies.includes(company) ? 'selected' : ''}`}
                      onClick={() => handleToggleCompany(company)}
                    >
                      {company}
                    </button>
                  ))}
              </div>
            </div>
            <span className="field-meta">최대 5개까지 선택 가능</span>
            {selectedCompanies.length > 0 && (
              <div className="selected-company-list">
                {selectedCompanies.map((company) => (
                  <button key={company} type="button" className="selected-company-chip" onClick={() => handleToggleCompany(company)}>
                    {company} <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}
            {companyError && <span className="field-error">{companyError}</span>}
          </fieldset>

          <label className="field-group full-width">
            <span className="field-label">포트폴리오 (PDF)</span>
            <input type="file" accept=".pdf,application/pdf" onChange={handlePortfolioChange} />
            <span className="file-meta">
              {portfolioFile ? `${portfolioFile.name} (${Math.max(1, Math.round(portfolioFile.size / 1024))} KB)` : '선택된 파일 없음'}
            </span>
            {portfolioError && <span className="field-error">{portfolioError}</span>}
          </label>

          <button type="submit" className="start-button">
            다음으로
          </button>
        </form>
      </section>
    </main>
  )
}

export default OnboardingPage
