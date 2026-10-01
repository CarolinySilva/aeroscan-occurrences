type Summary = {
    total: number
    open: number
    acknowledged: number
  }
  
  type SummaryCardsProps = {
    summary: Summary
  }
  
  function SummaryCards({
    summary,
  }: SummaryCardsProps) {
    return (
      <div className="summary">
        <div className="summary-item">
          <strong>{summary.total}</strong>
          <span>Total</span>
        </div>
  
        <div className="summary-item">
          <strong>{summary.open}</strong>
          <span>Abertas</span>
        </div>
  
        <div className="summary-item">
          <strong>
            {summary.acknowledged}
          </strong>
          <span>Reconhecidas</span>
        </div>
      </div>
    )
  }
  
  export default SummaryCards