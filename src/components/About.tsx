export default function About() {
  return (
    <div className="about">
      <div className="card">
        <h2>Why use it?</h2>
        <p className="muted">It answers the questions you can't track in your head:</p>
        <ul className="about-list muted">
          <li>
            <strong>Are you ahead?</strong> See your net savings — what you saved
            on parking minus what you paid in fines.
          </li>
          <li>
            <strong>When do fines happen?</strong> Log the time of each fine to
            reveal the peak enforcement window.
          </li>
          <li>
            <strong>Should you pay sometimes?</strong> Compare never paying
            against paying only during the busiest window.
          </li>
        </ul>
      </div>

      <div className="card">
        <h2>Getting started</h2>
        <p className="muted">
          Open <strong>Add</strong> to log a day (and the fine time if you were
          fined). Your numbers update on <strong>Stats</strong>, past entries
          live in <strong>History</strong>, and rates and storage are managed in{' '}
          <strong>Data</strong>.
        </p>
      </div>
    </div>
  );
}
