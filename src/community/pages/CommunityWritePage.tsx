import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createCommunityPost } from '../../api/services/communityService'
import CommunityPostTypeSelector from '../components/CommunityPostTypeSelector'
import TagSelector from '../components/TagSelector'
import { getRoadmapShareCandidates } from '../services/roadmapShareService'
import type { CommunityPostType, JobTrackTagKey, RoadmapShareCandidate } from '../types/community'
import { normalizeTagInput } from '../utils/communityFormat'
import '../styles/community-pages.css'

/** 저장한 로드맵의 "공유하기"에서 넘어올 때 함께 오는 값. */
type CommunityWriteLocationState = {
  initialPostType?: CommunityPostType
  initialRoadmapId?: string
  initialTitle?: string
  initialRoadmapSummary?: string
} | null

function CommunityWritePage() {
  const navigate = useNavigate()
  const initialState = useLocation().state as CommunityWriteLocationState
  const [selectedTag, setSelectedTag] = useState<JobTrackTagKey>('b2c')
  const [postType, setPostType] = useState<CommunityPostType>(initialState?.initialPostType ?? 'general')
  const [title, setTitle] = useState(initialState?.initialTitle ?? '')
  const [content, setContent] = useState(initialState?.initialRoadmapSummary ?? '')
  const [company, setCompany] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [techStacksInput, setTechStacksInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  /** 공유할 수 있는 저장한 로드맵. 로드맵 공유를 고르면 한 번 불러온다. null 이면 아직 받지 못했다. */
  const [roadmapCandidates, setRoadmapCandidates] = useState<RoadmapShareCandidate[] | null>(null)
  const [isCandidateError, setIsCandidateError] = useState(false)
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(initialState?.initialRoadmapId ?? '')

  useEffect(() => {
    if (postType !== 'roadmap' || roadmapCandidates !== null || isCandidateError) {
      return
    }

    let isMounted = true

    getRoadmapShareCandidates()
      .then((candidates) => {
        if (isMounted) {
          setRoadmapCandidates(candidates)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsCandidateError(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [postType, roadmapCandidates, isCandidateError])

  const handleTagSelect = (tag: JobTrackTagKey | 'all') => {
    if (tag !== 'all') {
      setSelectedTag(tag)
    }
  }

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0] ?? null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('제목과 본문을 입력해 주세요.')
      return
    }

    const selectedRoadmap = roadmapCandidates?.find((roadmap) => roadmap.id === selectedRoadmapId) ?? null

    // 로드맵 공유 글은 저장한 로드맵의 직무와 단계를 싣는다. 고르지 않으면 목표 직무가 없어 저장되지 않는다.
    if (postType === 'roadmap' && !selectedRoadmap) {
      alert('공유할 로드맵을 선택해 주세요.')
      return
    }

    // 백엔드는 인터뷰 글에 회사와 직무를 요구한다.
    if (postType === 'interview' && (!company.trim() || !jobRole.trim())) {
      alert('합격 후기 / 인터뷰 글은 회사와 직무를 입력해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createCommunityPost({
        type: postType,
        tag: selectedTag,
        title: title.trim(),
        content: content.trim(),
        company: company.trim(),
        jobRole: jobRole.trim(),
        techStacks: normalizeTagInput(techStacksInput),
        image: postType === 'general' ? imageFile : null,
        roadmap: postType === 'roadmap' ? selectedRoadmap : null,
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
      <section className="community-container community-write-panel">
        <h1>게시글 작성</h1>
        <p className="community-subtext">백엔드 스키마에 맞는 필드만 입력받도록 작성 폼을 정리했습니다.</p>

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

          {postType === 'roadmap' ? (
            <div className="community-field-block">
              <label htmlFor="community-roadmap">공유할 로드맵</label>
              {roadmapCandidates === null && !isCandidateError ? (
                <p className="community-upload-note">저장한 로드맵을 불러오는 중입니다...</p>
              ) : null}
              {isCandidateError ? <p className="community-upload-note">저장한 로드맵을 불러오지 못했습니다.</p> : null}
              {roadmapCandidates?.length === 0 ? (
                <p className="community-upload-note">저장한 로드맵이 없습니다. 로드맵을 먼저 만들어 저장해 주세요.</p>
              ) : null}
              {roadmapCandidates && roadmapCandidates.length > 0 ? (
                <select id="community-roadmap" value={selectedRoadmapId} onChange={(event) => setSelectedRoadmapId(event.target.value)}>
                  <option value="">로드맵을 선택해 주세요</option>
                  {roadmapCandidates.map((roadmap) => (
                    <option key={roadmap.id} value={roadmap.id}>
                      {roadmap.roadmapTitle} · {roadmap.targetJob}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          ) : null}

          <div className="community-inline-field-grid">
            <div className="community-field-block">
              <label htmlFor="community-company">회사</label>
              <input
                id="community-company"
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="예: 네이버"
              />
            </div>

            <div className="community-field-block">
              <label htmlFor="community-job-role">직무</label>
              <input
                id="community-job-role"
                type="text"
                value={jobRole}
                onChange={(event) => setJobRole(event.target.value)}
                placeholder="예: 백엔드 개발자"
              />
            </div>
          </div>

          <div className="community-field-block">
            <label htmlFor="community-tech-stacks">기술 스택</label>
            <input
              id="community-tech-stacks"
              type="text"
              value={techStacksInput}
              onChange={(event) => setTechStacksInput(event.target.value)}
              placeholder="쉼표로 구분해 입력해 주세요. 예: Java, Spring Boot, MySQL"
            />
          </div>

          <div className="community-field-block">
            <label htmlFor="community-content">본문</label>
            <textarea
              id="community-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="백엔드 스키마 범위 안에서 글 내용을 작성해 주세요."
              rows={10}
            />
          </div>

          {postType === 'general' ? (
            <div className="community-field-block">
              <label htmlFor="community-image">사진 첨부</label>
              <input id="community-image" type="file" accept="image/*" onChange={handleImageSelect} />
              <p className="community-upload-note">{imageFile ? `선택됨: ${imageFile.name}` : '일반 게시글만 이미지 첨부를 지원합니다.'}</p>
            </div>
          ) : (
            <p className="community-upload-note">로드맵 공유와 인터뷰 후기는 추가 메타 필드를 줄이고 공통 스키마로 저장합니다.</p>
          )}

          <p className="community-upload-note">대댓글, 댓글 신고/삭제, 확장 메타 필드는 백엔드 확장 후 다시 열 예정입니다.</p>

          <div className="community-submit-row">
            <button type="button" className="community-outline-btn" onClick={() => navigate('/community')}>
              목록으로
            </button>
            <button type="submit" className="community-primary-btn" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '게시글 등록'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default CommunityWritePage
