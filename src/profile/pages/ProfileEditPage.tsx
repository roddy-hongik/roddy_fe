import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfileSummary, updateProfile } from '../../api/services/profileService'
import type { UpdateProfilePayload } from '../types/profile'

type ProfileEditForm = {
  name: string
  age: string
  imageFile: File | null
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve(result)
    }
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'))
    reader.readAsDataURL(file)
  })
}

function ProfileEditPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<ProfileEditForm>({
    name: localStorage.getItem('userName') ?? '',
    age: localStorage.getItem('userAge') ?? '',
    imageFile: null,
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
          imageFile: null,
        })
        setPreviewUrl(data.imageUrl)
      })
      .catch(() => {
        // Fallback to local storage values.
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null

    if (!nextFile) {
      setForm((current) => ({ ...current, imageFile: null }))
      return
    }

    setForm((current) => ({ ...current, imageFile: nextFile }))

    const objectUrl = URL.createObjectURL(nextFile)
    setPreviewUrl(objectUrl)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload: UpdateProfilePayload = {
        name: form.name.trim(),
        age: Number(form.age),
      }

      if (form.imageFile) {
        payload.imageBase64 = await fileToBase64(form.imageFile)
      }

      const updated = await updateProfile(payload)

      localStorage.setItem('userName', updated.name)
      localStorage.setItem('userAge', String(updated.age))
      if (updated.imageUrl) {
        localStorage.setItem('userImageUrl', updated.imageUrl)
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
          <p>이미지, 이름, 나이를 업데이트할 수 있습니다.</p>
        </header>

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <label className="profile-field">
            <span>프로필 이미지</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>

          {previewUrl && <img className="profile-preview-image" src={previewUrl} alt="프로필 미리보기" />}

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
