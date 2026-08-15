import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfileSummary, updateProfile } from '../../api/services/profileService'
import type { UpdateProfilePayload } from '../types/profile'

type ProfileEditForm = {
  name: string
  age: string
}

function ProfileEditPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ProfileEditForm>({
    name: localStorage.getItem('userName') ?? '',
    age: localStorage.getItem('userAge') ?? '',
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(localStorage.getItem('userImageUrl'))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    let isMounted = true

    getProfileSummary()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setForm({
          name: data.name,
          age: String(data.age),
        })
        setPreviewUrl(data.profileImageUrl)
      })
      .catch(() => {
        // Fallback to local storage values.
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload: UpdateProfilePayload = {
        name: form.name.trim(),
        age: Number(form.age),
      }

      const updated = await updateProfile(payload)

      localStorage.setItem('userName', updated.name)
      localStorage.setItem('userAge', String(updated.age))
      if (updated.profileImageUrl) {
        localStorage.setItem('userImageUrl', updated.profileImageUrl)
      }

      navigate('/profile')
    } catch {
      const fallbackName = form.name.trim()
      const fallbackAge = String(Number(form.age) || 0)

      localStorage.setItem('userName', fallbackName)
      localStorage.setItem('userAge', fallbackAge)
      if (previewUrl) {
        localStorage.setItem('userImageUrl', previewUrl)
      }
      navigate('/profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="profile-page profile-fade-in">
      <section className="profile-card profile-edit-card">
        <header className="profile-card-header">
          <h1>프로필 수정</h1>
          <p>백엔드 스펙 기준으로 이름과 나이를 수정할 수 있습니다.</p>
        </header>

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          {previewUrl && <img className="profile-preview-image" src={previewUrl} alt="프로필 미리보기" />}

          <p className="profile-meta-text">프로필 이미지 업로드는 백엔드 전용 업로드 API가 준비되면 다시 열 예정입니다.</p>

          <label className="profile-field">
            <span>이름</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </label>

          <label className="profile-field">
            <span>나이</span>
            <input
              type="number"
              min={0}
              value={form.age}
              onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
              required
            />
          </label>

          <div className="profile-form-actions">
            <button type="button" className="profile-ghost-btn" onClick={() => navigate('/profile')}>
              취소
            </button>
            <button type="submit" className="profile-action-btn" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ProfileEditPage
