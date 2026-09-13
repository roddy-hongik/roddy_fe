import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getProfileSummary,
  requestProfileImagePresign,
  updateProfile,
  uploadProfileImage,
} from '../../api/services/profileService'
import type { UpdateProfilePayload } from '../types/profile'

const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024
const PROFILE_IMAGE_TYPES = new Set(['image/png', 'image/jpeg'])

type ProfileEditForm = {
  name: string
  age: string
}

function ProfileEditPage() {
  const navigate = useNavigate()
  const hasEditedImage = useRef(false)
  const [form, setForm] = useState<ProfileEditForm>({
    name: localStorage.getItem('userName') ?? '',
    age: localStorage.getItem('userAge') ?? '',
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(localStorage.getItem('userImageUrl'))
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [removeProfileImage, setRemoveProfileImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

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
        if (!hasEditedImage.current) {
          setPreviewUrl(data.profileImageUrl)
        }
      })
      .catch(() => {
        // Fallback to local storage values.
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setSubmitError('')
    if (!PROFILE_IMAGE_TYPES.has(file.type)) {
      setSubmitError('PNG 또는 JPG 이미지만 선택할 수 있습니다.')
      event.target.value = ''
      return
    }
    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      setSubmitError('프로필 이미지는 5MB 이하만 선택할 수 있습니다.')
      event.target.value = ''
      return
    }

    setSelectedImage(file)
    setRemoveProfileImage(false)
    hasEditedImage.current = true
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setRemoveProfileImage(true)
    hasEditedImage.current = true
    setPreviewUrl(null)
    setSubmitError('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    try {
      let profileImageObjectKey: string | undefined
      if (selectedImage) {
        const presign = await requestProfileImagePresign(selectedImage.name)
        await uploadProfileImage(presign, selectedImage)
        profileImageObjectKey = presign.objectKey
      }

      const payload: UpdateProfilePayload = {
        name: form.name.trim(),
        age: Number(form.age),
        profileImageObjectKey,
        removeProfileImage: removeProfileImage || undefined,
      }

      const updated = await updateProfile(payload)

      localStorage.setItem('userName', updated.name)
      localStorage.setItem('userAge', String(updated.age))
      if (updated.profileImageUrl) {
        localStorage.setItem('userImageUrl', updated.profileImageUrl)
      } else {
        localStorage.removeItem('userImageUrl')
      }

      navigate('/profile')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '프로필 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="profile-page profile-fade-in">
      <section className="profile-card profile-edit-card">
        <header className="profile-card-header">
          <h1>프로필 수정</h1>
          <p>이름, 나이와 프로필 이미지를 수정할 수 있습니다.</p>
        </header>

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          {previewUrl && <img className="profile-preview-image" src={previewUrl} alt="프로필 미리보기" />}

          <label className="profile-field">
            <span>프로필 이미지</span>
            <input
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              onChange={handleImageChange}
              disabled={isSubmitting}
            />
            <small>PNG 또는 JPG, 최대 5MB</small>
          </label>
          {previewUrl ? (
            <button
              type="button"
              className="profile-ghost-btn profile-image-remove-btn"
              onClick={handleRemoveImage}
              disabled={isSubmitting}
            >
              이미지 삭제
            </button>
          ) : null}
          {submitError ? <p className="profile-error-text">{submitError}</p> : null}

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
