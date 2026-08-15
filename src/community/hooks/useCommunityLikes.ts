import { useEffect, useState } from 'react'
import { likeCommunityPost } from '../../api/services/communityService'

export function useCommunityPostLike(postId: string, initialLiked = false) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsLiked(initialLiked)
  }, [initialLiked])

  const handleToggle = async () => {
    setIsSubmitting(true)

    try {
      const response = await likeCommunityPost(postId)
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
