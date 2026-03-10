import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import JobCategorySelector from '../../onboarding/components/JobCategorySelector'
import { requestProfileReanalysis } from '../../api/services/profileService'
import { PROFILE_COMPANIES_BY_CATEGORY, PROFILE_JOB_CATEGORIES } from '../constants'

type ReanalyzeFormState = {
  reportTitle: string
  portfolioFile: File | null
  selectedCategories: string[]
  preferredCompanies: string[]
  companyQuery: string
}

function ProfileReanalyzePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ReanalyzeFormState>({
    reportTitle: '',
    portfolioFile: null,
    selectedCategories: [],
    preferredCompanies: [],
    companyQuery: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (!isAnalyzing) {
      return
    }

    const timerId = window.setTimeout(() => {
      navigate('/', { replace: true })
    }, 2600)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [isAnalyzing, navigate])

  const canSubmit = useMemo(() => {
    return Boolean(form.reportTitle.trim() && form.selectedCategories.length > 0 && form.preferredCompanies.length > 0)
  }, [form.preferredCompanies.length, form.reportTitle, form.selectedCategories.length])

  const availableCompanies = useMemo(() => {
    const merged = form.selectedCategories.flatMap((categoryId) => PROFILE_COMPANIES_BY_CATEGORY[categoryId] ?? [])
    return Array.from(new Set(merged))
  }, [form.selectedCategories])

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = form.companyQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return availableCompanies
    }

    return availableCompanies.filter((company) => company.toLowerCase().includes(normalizedQuery))
  }, [availableCompanies, form.companyQuery])

  const handlePortfolioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null

    if (!nextFile) {
      setForm((current) => ({ ...current, portfolioFile: null }))
      return
    }

    const isPdf = nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      setErrorMessage('이력서는 PDF 형식만 업로드할 수 있습니다.')
      event.target.value = ''
      setForm((current) => ({ ...current, portfolioFile: null }))
      return
    }

    setErrorMessage('')
    setForm((current) => ({ ...current, portfolioFile: nextFile }))
  }

  const handleToggleCategory = (categoryId: string) => {
    setForm((current) => {
      if (current.selectedCategories.includes(categoryId)) {
        const nextSelectedCategories = current.selectedCategories.filter((id) => id !== categoryId)
        const nextAvailableCompanies = Array.from(
          new Set(nextSelectedCategories.flatMap((id) => PROFILE_COMPANIES_BY_CATEGORY[id] ?? [])),
        )
        return {
          ...current,
          selectedCategories: nextSelectedCategories,
          preferredCompanies: current.preferredCompanies.filter((company) => nextAvailableCompanies.includes(company)),
        }
      }

      if (current.selectedCategories.length >= 2) {
        setErrorMessage('희망 직무 카테고리는 최대 2개까지 선택할 수 있습니다.')
        return current
      }

      setErrorMessage('')
      return {
        ...current,
        selectedCategories: [...current.selectedCategories, categoryId],
      }
    })
  }

  const handleToggleCompany = (company: string) => {
    setForm((current) => {
      if (current.preferredCompanies.includes(company)) {
        return {
          ...current,
          preferredCompanies: current.preferredCompanies.filter((item) => item !== company),
        }
      }

      if (current.preferredCompanies.length >= 5) {
        setErrorMessage('희망 기업은 최대 5개까지 등록할 수 있습니다.')
        return current
      }

      setErrorMessage('')
      return {
        ...current,
        preferredCompanies: [...current.preferredCompanies, company],
      }
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (form.selectedCategories.length === 0) {
      setErrorMessage('희망 직무 카테고리를 선택해 주세요.')
      return
    }

    if (!form.reportTitle.trim()) {
      setErrorMessage('리포트 제목을 입력해 주세요.')
      return
    }

    if (form.preferredCompanies.length === 0) {
      setErrorMessage('희망 기업을 1개 이상 입력해 주세요.')
      return
    }

    setErrorMessage('')

    try {
      await requestProfileReanalysis({
        reportTitle: form.reportTitle.trim(),
        portfolioFileName: form.portfolioFile?.name ?? '',
        categories: form.selectedCategories,
        preferredCompanies: form.preferredCompanies,
      })
    } catch {
      // Keep UX flow even when API is unavailable.
    }

    setIsAnalyzing(true)
  }

  if (isAnalyzing) {
    return (
      <div className="profile-page profile-fade-in reanalyze-page-center">
        <section className="profile-card reanalyze-loading-card" aria-live="polite">
          <div className="roddy-loader" aria-hidden="true">
            <div className="roddy-loader-orbit" />
            <div className="roddy-loader-body" />
          </div>
          <h1>분석 중...</h1>
          <p>업로드한 이력서와 선택한 직무를 기준으로 기술 스택을 재분석하고 있습니다.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="profile-page profile-fade-in">
      <section className="profile-card">
        <header className="profile-card-header">
          <h1>다시 분석하기</h1>
          <p>입력값을 다시 선택하면 최신 기준으로 내 기술 스택을 갱신합니다.</p>
        </header>

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <label className="profile-field">
            <span>리포트 제목</span>
            <input
              type="text"
              value={form.reportTitle}
              placeholder="예: 2026 3월 기술 재분석 리포트"
              onChange={(event) => {
                setErrorMessage('')
                setForm((current) => ({ ...current, reportTitle: event.target.value }))
              }}
            />
            <small>재분석 결과 리포트 제목으로 사용됩니다.</small>
          </label>

          <label className="profile-field">
            <span>이력서(포트폴리오) 재업로드</span>
            <input type="file" accept="application/pdf,.pdf" onChange={handlePortfolioChange} />
            {form.portfolioFile && <small>{form.portfolioFile.name}</small>}
            {!form.portfolioFile && <small>선택 사항: PDF 없이도 재분석할 수 있습니다.</small>}
          </label>

          <fieldset className="profile-fieldset">
            <legend>희망 직무 카테고리 재선택</legend>
            <JobCategorySelector
              categories={PROFILE_JOB_CATEGORIES}
              selectedCategories={form.selectedCategories}
              onToggleCategory={handleToggleCategory}
            />
          </fieldset>

          <label className="profile-field">
            <span>희망 기업 재선택</span>
            <input
              type="text"
              placeholder={
                form.selectedCategories.length === 0 ? '먼저 희망 직무 카테고리를 선택해 주세요' : '기업명을 검색해 주세요'
              }
              value={form.companyQuery}
              onChange={(event) => setForm((current) => ({ ...current, companyQuery: event.target.value }))}
              disabled={form.selectedCategories.length === 0}
            />
          </label>

          <div className="profile-company-option-list" role="listbox" aria-label="희망 기업 검색 결과">
            {form.selectedCategories.length === 0 && (
              <p className="profile-company-option-empty">직군 카테고리를 먼저 선택해 주세요.</p>
            )}
            {form.selectedCategories.length > 0 && filteredCompanies.length === 0 && (
              <p className="profile-company-option-empty">검색 결과가 없습니다.</p>
            )}
            {form.selectedCategories.length > 0 &&
              filteredCompanies.map((company) => (
                <button
                  key={company}
                  type="button"
                  className={`profile-company-option ${form.preferredCompanies.includes(company) ? 'selected' : ''}`}
                  onClick={() => handleToggleCompany(company)}
                >
                  {company}
                </button>
              ))}
          </div>

          {form.preferredCompanies.length > 0 && (
            <div className="profile-company-tags">
              {form.preferredCompanies.map((company) => (
                <button
                  key={company}
                  type="button"
                  className="profile-company-tag"
                  onClick={() => handleToggleCompany(company)}
                >
                  {company} ×
                </button>
              ))}
            </div>
          )}

          {errorMessage && <p className="profile-error-text">{errorMessage}</p>}

          <div className="profile-form-actions">
            <button type="button" className="profile-ghost-btn" onClick={() => navigate('/profile')}>
              취소
            </button>
            <button type="submit" className="profile-action-btn" disabled={!canSubmit}>
              내 기술스택 분석하기
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ProfileReanalyzePage
