import { type ChangeEvent, type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCommunityPost } from '../../api/services/communityService'
import CommunityTopNav from '../components/CommunityTopNav'
import TagSelector from '../components/TagSelector'
import type { JobTrackTagKey } from '../types/community'
import '../styles/community-pages.css'

function CommunityWritePage() {
  const navigate = useNavigate()
  const [selectedTag, setSelectedTag] = useState<JobTrackTagKey>('b2c')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFile(event.target.files?.[0] ?? null)
  }

  const handleTagSelect = (tag: JobTrackTagKey | 'all') => {
    if (tag !== 'all') {
      setSelectedTag(tag)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('제목과 본문을 입력해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await createCommunityPost({
        tag: selectedTag,
        title: title.trim(),
        content: content.trim(),
        image: imageFile,
      })

      navigate(`/community/${response.id}`)
    } catch {
      navigate('/community')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="community-page">
      <CommunityTopNav />

      <section className="community-container community-write-panel">
        <h1>게시글 작성</h1>
        <p className="community-subtext">직무 태그를 선택하고, 질문 또는 경험을 명확하게 작성해 보세요.</p>

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

          <button type="submit" className="community-primary-btn community-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? '작성 중...' : '작성 완료'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default CommunityWritePage
