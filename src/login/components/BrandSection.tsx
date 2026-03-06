function BrandSection() {
  return (
    <>
      <p className="brand-pill">Developer Compass</p>
      <h1>
        개발자들의 길잡이,
        <br />
        Roddy
      </h1>
      <p className="brand-copy">
        막막한 시작부터 성장의 과정까지.
        <br />
        Roddy와 함께 매일 더 나은 개발 습관을 만들어보세요.
      </p>

      <div className="mascot" aria-hidden="true">
        <div className="mascot-ear left" />
        <div className="mascot-ear right" />
        <div className="mascot-face">
          <span className="eye" />
          <span className="eye" />
          <span className="mouth" />
        </div>
        <div className="mascot-body" />
      </div>
    </>
  )
}

export default BrandSection
