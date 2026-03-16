import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCommunityPost } from '../../api/services/communityService'
import CommunityPostTypeSelector from '../components/CommunityPostTypeSelector'
import CommunityTopNav from '../components/CommunityTopNav'
import TagSelector from '../components/TagSelector'
import { getRoadmapShareCandidates } from '../services/roadmapShareService'
import type { CommunityPostType, InterviewSubtype, JobTrackTagKey, RoadmapShareCandidate } from '../types/community'
import { normalizeTagInput } from '../utils/communityFormat'
import '../styles/community-pages.css'

function CommunityWritePage() {
  const navigate = useNavigate()
  const [selectedTag, setSelectedTag] = useState<JobTrackTagKey>('b2c')
  const [postType, setPostType] = useState<CommunityPostType>('general')
  const [title, setTitle] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [content, setContent] = useState('')
  const [roadmaps, setRoadmaps] = useState<RoadmapShareCandidate[]>([])
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('')
  const [roadmapSummary, setRoadmapSummary] = useState('')
  const [roadmapTagInput, setRoadmapTagInput] = useState('')
  const [interviewSubtype, setInterviewSubtype] = useState<InterviewSubtype>('accepted')
  const [company, setCompany] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [preparationPeriod, setPreparationPeriod] = useState('')
  const [techStacksInput, setTechStacksInput] = useState('')
  const [processSummary, setProcessSummary] = useState('')
  const [background, setBackground] = useState('')
  const [preparationProcess, setPreparationProcess] = useState('')
  const [experienceDetail, setExperienceDetail] = useState('')
  const [advice, setAdvice] = useState('')
  const [interviewTagInput, setInterviewTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(true)
  const [isRoadmapError, setIsRoadmapError] = useState(false)

  useEffect(() => {
    let isMounted = true

    getRoadmapShareCandidates()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setRoadmaps(data)
        setSelectedRoadmapId(data[0]?.id ?? '')
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setRoadmaps([])
        setIsRoadmapError(true)
      })
      .finally(() => {
        if (isMounted) {
          setIsRoadmapLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const selectedRoadmap = useMemo(() => roadmaps.find((roadmap) => roadmap.id === selectedRoadmapId) ?? null, [roadmaps, selectedRoadmapId])

  useEffect(() => {
    if (postType !== 'roadmap' || !selectedRoadmap) {
      return
    }

    if (!title.trim()) {
      setTitle(`${selectedRoadmap.targetJob} 로드맵을 공유합니다`)
    }

    if (!roadmapSummary.trim()) {
      setRoadmapSummary(`${selectedRoadmap.targetJob} 준비 과정에서 정리한 학습 로드맵입니다.`)
    }
  }, [postType, roadmapSummary, selectedRoadmap, title])

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0] ?? null)
  }

  const handleTagSelect = (tag: JobTrackTagKey | 'all') => {
    if (tag !== 'all') {
      setSelectedTag(tag)
    }
  }

  const validateForm = () => {
    if (!title.trim()) {
      alert('제목을 입력해 주세요.')
      return false
    }

    if (postType === 'general' && !content.trim()) {
      alert('본문을 입력해 주세요.')
      return false
    }

    if (postType === 'roadmap') {
      if (!selectedRoadmap) {
        alert('공유할 로드맵을 선택해 주세요.')
        return false
      }

      if (!roadmapSummary.trim()) {
        alert('로드맵 소개를 입력해 주세요.')
        return false
      }
    }

    if (postType === 'interview') {
      if (!company.trim() || !jobRole.trim() || !preparationPeriod.trim()) {
        alert('기업명, 직무, 준비 기간을 입력해 주세요.')
        return false
      }

      if (!processSummary.trim() || !background.trim() || !preparationProcess.trim() || !experienceDetail.trim() || !advice.trim()) {
        alert('후기/인터뷰의 핵심 섹션을 모두 작성해 주세요.')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response =
        postType === 'general'
          ? await createCommunityPost({
              type: 'general',
              tag: selectedTag,
              title: title.trim(),
              content: content.trim(),
              image: imageFile,
            })
          : postType === 'roadmap' && selectedRoadmap
            ? await createCommunityPost({
                type: 'roadmap',
                tag: selectedTag,
                title: title.trim(),
                summary: roadmapSummary.trim(),
                roadmapId: selectedRoadmap.id,
                roadmapTitle: selectedRoadmap.roadmapTitle,
                targetJob: selectedRoadmap.targetJob,
                targetCompany: selectedRoadmap.targetCompany,
                recommendedSkills: selectedRoadmap.recommendedSkills,
                roadmapSteps: selectedRoadmap.roadmapSteps,
                tags: normalizeTagInput(roadmapTagInput),
              })
            : await createCommunityPost({
                type: 'interview',
                tag: selectedTag,
                title: title.trim(),
                subtype: interviewSubtype,
                company: company.trim(),
                jobRole: jobRole.trim(),
                preparationPeriod: preparationPeriod.trim(),
                techStacks: normalizeTagInput(techStacksInput),
                processSummary: processSummary.trim(),
                background: background.trim(),
                preparationProcess: preparationProcess.trim(),
                experienceDetail: experienceDetail.trim(),
                advice: advice.trim(),
                tags: normalizeTagInput(interviewTagInput),
              })

      navigate(`/community/${response.id}`)
    } catch {
      alert('게시글 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="community-page">
      <CommunityTopNav />

      <section className="community-container community-write-panel">
        <h1>게시글 작성</h1>
        <p className="community-subtext">게시글 유형에 맞는 템플릿으로 내용을 구조화해 공유하세요.</p>

        <CommunityPostTypeSelector selectedType={postType} onSelectType={setPostType} />

        <form className="community-write-form" onSubmit={handleSubmit}>
          <div className="community-field-block">
            <label>직무 태그</label>
            <TagSelector selectedTag={selectedTag} onSelectTag={handleTagSelect} />
          </div>

          <div className="community-field-block">
            <label htmlFor="community-title">제목</label>
            <input
              id="community-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="게시글 제목을 입력해 주세요"
              maxLength={100}
            />
          </div>

          {postType === 'general' ? (
            <>
              <div className="community-field-block">
                <label htmlFor="community-content">본문</label>
                <textarea
                  id="community-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="질문/경험/배경 정보를 자세히 작성해 주세요"
                  rows={10}
                />
              </div>

              <div className="community-field-block">
                <label htmlFor="community-image">사진 첨부</label>
                <input id="community-image" type="file" accept="image/*" onChange={handleImageSelect} />
                <p className="community-upload-note">{imageFile ? `선택됨: ${imageFile.name}` : 'PNG, JPG 파일을 첨부할 수 있습니다.'}</p>
              </div>
            </>
          ) : null}

          {postType === 'roadmap' ? (
            <>
              <div className="community-field-block">
                <label htmlFor="community-roadmap-select">공개할 로드맵 선택</label>
                <select
                  id="community-roadmap-select"
                  value={selectedRoadmapId}
                  onChange={(event) => setSelectedRoadmapId(event.target.value)}
                  disabled={isRoadmapLoading || roadmaps.length === 0}
                >
                  {roadmaps.map((roadmap) => (
                    <option key={roadmap.id} value={roadmap.id}>
                      {roadmap.roadmapTitle}
                    </option>
                  ))}
                </select>
                {isRoadmapLoading ? <p className="community-upload-note">저장된 로드맵을 불러오는 중입니다...</p> : null}
                {!isRoadmapLoading && isRoadmapError ? <p className="community-upload-note">로드맵을 불러오지 못했습니다.</p> : null}
              </div>

              {selectedRoadmap ? (
                <section className="community-preview-card">
                  <div className="community-preview-header">
                    <div>
                      <strong>{selectedRoadmap.roadmapTitle}</strong>
                      <p>
                        {selectedRoadmap.targetJob} · {selectedRoadmap.targetCompany || '목표 기업 없음'}
                      </p>
                    </div>
                    <span>{selectedRoadmap.roadmapSteps.length}단계</span>
                  </div>
                  <div className="community-chip-row">
                    {selectedRoadmap.recommendedSkills.map((skill) => (
                      <span key={skill} className="community-meta-chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="community-field-block">
                <label htmlFor="community-roadmap-summary">한 줄 소개</label>
                <textarea
                  id="community-roadmap-summary"
                  value={roadmapSummary}
                  onChange={(event) => setRoadmapSummary(event.target.value)}
                  placeholder="이 로드맵을 어떤 목적과 관점으로 공유하는지 적어 주세요"
                  rows={4}
                />
              </div>

              <div className="community-field-block">
                <label htmlFor="community-roadmap-tags">추가 태그</label>
                <input
                  id="community-roadmap-tags"
                  type="text"
                  value={roadmapTagInput}
                  onChange={(event) => setRoadmapTagInput(event.target.value)}
                  placeholder="쉼표로 구분해 입력해 주세요. 예: 금융권, 백엔드, 포트폴리오"
                />
              </div>
            </>
          ) : null}

          {postType === 'interview' ? (
            <>
              <div className="community-inline-field-grid">
                <div className="community-field-block">
                  <label htmlFor="community-interview-type">글 유형</label>
                  <select id="community-interview-type" value={interviewSubtype} onChange={(event) => setInterviewSubtype(event.target.value as InterviewSubtype)}>
                    <option value="accepted">합격 후기</option>
                    <option value="incumbent">현직자 인터뷰</option>
                  </select>
                </div>

                <div className="community-field-block">
                  <label htmlFor="community-company">기업명</label>
                  <input id="community-company" type="text" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="예: 카카오" />
                </div>

                <div className="community-field-block">
                  <label htmlFor="community-job-role">직무</label>
                  <input id="community-job-role" type="text" value={jobRole} onChange={(event) => setJobRole(event.target.value)} placeholder="예: 백엔드 개발자" />
                </div>

                <div className="community-field-block">
                  <label htmlFor="community-preparation-period">준비 기간</label>
                  <input
                    id="community-preparation-period"
                    type="text"
                    value={preparationPeriod}
                    onChange={(event) => setPreparationPeriod(event.target.value)}
                    placeholder="예: 6개월"
                  />
                </div>
              </div>

              <div className="community-field-block">
                <label htmlFor="community-tech-stacks">기술 스택 태그</label>
                <input
                  id="community-tech-stacks"
                  type="text"
                  value={techStacksInput}
                  onChange={(event) => setTechStacksInput(event.target.value)}
                  placeholder="쉼표로 구분해 입력해 주세요. 예: Java, Spring Boot, Redis"
                />
              </div>

              <div className="community-field-block">
                <label htmlFor="community-process-summary">준비 과정 요약</label>
                <textarea
                  id="community-process-summary"
                  value={processSummary}
                  onChange={(event) => setProcessSummary(event.target.value)}
                  placeholder="한눈에 보이는 요약을 작성해 주세요"
                  rows={3}
                />
              </div>

              <div className="community-field-block">
                <label htmlFor="community-background">준비 배경</label>
                <textarea
                  id="community-background"
                  value={background}
                  onChange={(event) => setBackground(event.target.value)}
                  placeholder="취업 또는 실무 경험의 배경을 작성해 주세요"
                  rows={4}
                />
              </div>

              <div className="community-field-block">
                <label htmlFor="community-preparation-process">준비 과정</label>
                <textarea
                  id="community-preparation-process"
                  value={preparationProcess}
                  onChange={(event) => setPreparationProcess(event.target.value)}
                  placeholder="공부 방식, 프로젝트 정리, 면접 대비 과정을 적어 주세요"
                  rows={5}
                />
              </div>

              <div className="community-field-block">
                <label htmlFor="community-experience-detail">합격/실무 경험</label>
                <textarea
                  id="community-experience-detail"
                  value={experienceDetail}
                  onChange={(event) => setExperienceDetail(event.target.value)}
                  placeholder="면접, 과제, 실무에서 중요했던 포인트를 적어 주세요"
                  rows={5}
                />
              </div>

              <div className="community-field-block">
                <label htmlFor="community-advice">조언/회고</label>
                <textarea
                  id="community-advice"
                  value={advice}
                  onChange={(event) => setAdvice(event.target.value)}
                  placeholder="후배 개발자에게 전하고 싶은 조언 또는 회고를 적어 주세요"
                  rows={4}
                />
              </div>

              <div className="community-field-block">
                <label htmlFor="community-interview-tags">추가 태그</label>
                <input
                  id="community-interview-tags"
                  type="text"
                  value={interviewTagInput}
                  onChange={(event) => setInterviewTagInput(event.target.value)}
                  placeholder="쉼표로 구분해 입력해 주세요. 예: 카카오, 취업후기, 백엔드"
                />
              </div>
            </>
          ) : null}

          <button type="submit" className="community-primary-btn community-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? '작성 중...' : '작성 완료'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default CommunityWritePage
