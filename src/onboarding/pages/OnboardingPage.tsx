import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeOnboarding } from '../../api/services/onboardingService'
import type { DesiredJob } from '../../api/types/onboarding'
import { emitAuthChange } from '../../auth/utils/authEvents'
import { markOnboardingCompleted } from '../../auth/utils/authStorage'
import JobCategorySelector from '../components/JobCategorySelector'
import type { JobCategory } from '../components/JobCategorySelector'
import '../styles/onboarding-page.css'

const jobCategories: JobCategory[] = [
  {
    id: 'BACKEND',
    label: '백엔드',
    description: '서버, API, 데이터 처리, 분산 시스템 중심의 역할을 목표로 합니다.',
  },
  {
    id: 'FRONTEND',
    label: '프론트엔드',
    description: '웹 UI, 사용자 경험, 상태 관리와 인터랙션 구현에 집중하는 역할입니다.',
  },
  {
    id: 'FULLSTACK',
    label: '풀스택',
    description: '프론트와 백엔드를 모두 다루며 제품 전반을 빠르게 구현하는 역할입니다.',
  },
  {
    id: 'DATA_ENGINEER',
    label: '데이터 엔지니어',
    description: '데이터 파이프라인, ETL, 분석 기반 시스템 구축을 목표로 합니다.',
  },
  {
    id: 'DEVOPS',
    label: 'DevOps',
    description: '배포 자동화, 클라우드 인프라, 운영 효율화에 집중하는 역할입니다.',
  },
]

const companiesByCategory: Record<string, string[]> = {
  BACKEND: ['네이버', '카카오', '쿠팡', '당근', '우아한형제들'],
  FRONTEND: ['토스', '라인', '오늘의집', '직방', '리디'],
  FULLSTACK: ['마켓컬리', '강남언니', '스윗', '채널톡', '리멤버앤컴퍼니'],
  DATA_ENGINEER: ['카카오뱅크', '토스페이먼츠', '네이버클라우드', 'NHN Cloud', '메가존클라우드'],
  DEVOPS: ['AWS 코리아', '카카오엔터프라이즈', '네이버클라우드', 'NHN Cloud', '메가존클라우드'],
}

function OnboardingPage() {
  const navigate = useNavigate()
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
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const timeoutId = window.setTimeout(() => {
        setSelectedCompanies(nextSelectedCompanies)
        if (nextSelectedCompanies.length === 0) {
          setCompanyQuery('')
        }
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCategoryError('')
    setCompanyError('')
    setPortfolioError('')
    setSubmitError('')

    if (selectedCategories.length !== 1) {
      setCategoryError('희망 직무는 1개를 선택해 주세요.')
      return
    }

    if (careerType === 'years' && careerYears.trim() === '') {
      return
    }

    if (selectedCompanies.length === 0) {
      setCompanyError('선호 기업은 최소 1개 이상 선택해 주세요.')
      return
    }

    if (!portfolioFile) {
      setPortfolioError('포트폴리오 PDF는 필수입니다.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await completeOnboarding({
        name: name.trim(),
        age: Number(age),
        experienceYears: careerType === 'years' ? Number(careerYears) : 0,
        desiredJob: selectedCategories[0] as DesiredJob,
        desiredCompany: selectedCompanies.join(', '),
        portfolioFile,
      })

      localStorage.setItem('userName', response.name)
      localStorage.setItem('userPreferredCompanies', response.desiredCompany)
      localStorage.setItem('userAge', String(response.age))
      markOnboardingCompleted()
      emitAuthChange()
      navigate('/onboarding/github')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '온보딩 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((current) => {
      if (current.includes(categoryId)) {
        setCategoryError('')
        return current.filter((id) => id !== categoryId)
      }

      if (current.length >= 1) {
        setCategoryError('희망 직무는 1개만 선택할 수 있습니다.')
        return [categoryId]
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
            <span className="field-meta">백엔드 스펙에 맞춰 1개 직무를 선택합니다.</span>
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

          {submitError && <p className="field-error">{submitError}</p>}

          <button type="submit" className="start-button" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '다음으로'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default OnboardingPage
