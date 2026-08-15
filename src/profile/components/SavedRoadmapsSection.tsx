import SavedRoadmapsExplorer from '../../roadmap/components/SavedRoadmapsExplorer'

function SavedRoadmapsSection() {
  return (
    <SavedRoadmapsExplorer
      heading="저장된 로드맵"
      description="로드맵 페이지에서 저장한 결과를 확인하고 비교할 수 있습니다."
      containerClassName="profile-section profile-roadmap-section"
    />
  )
}

export default SavedRoadmapsSection
