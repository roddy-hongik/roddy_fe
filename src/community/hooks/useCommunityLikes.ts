import { useEffect, useState } from 'react'
import { isCommunityPostLiked, toggleCommunityPostLike } from '../services/communityLikeService'
import { RODDY_DATA_CHANGE_EVENT } from '../../shared/utils/localStorageSync'

const COMMUNITY_LIKE_STORAGE_KEY = 'roddy.community.likes.v1'

export function useCommunityPostLike(postId: string) {
  const [isLiked, setIsLiked] = useState(() => isCommunityPostLiked(postId))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsLiked(isCommunityPostLiked(postId))

    const syncState = () => {
      setIsLiked(isCommunityPostLiked(postId))
    }

    const handleDataChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>
      if (customEvent.detail?.key === COMMUNITY_LIKE_STORAGE_KEY) {
        syncState()
      }
    }

    window.addEventListener('storage', syncState)
    window.addEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)

    return () => {
      window.removeEventListener('storage', syncState)
      window.removeEventListener(RODDY_DATA_CHANGE_EVENT, handleDataChange)
    }
  }, [postId])

  const handleToggle = async () => {
    setIsSubmitting(true)

    try {
      const response = await toggleCommunityPostLike(postId)
      setIsLiked(response.isLiked)
      return response
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isLiked,
    isSubmitting,
    toggleLike: handleToggle,
  }
}
