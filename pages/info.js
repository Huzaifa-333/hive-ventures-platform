export default function ProjectInfo() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '2rem', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <h1>Hive Construction Ventures</h1>
      <h3>Final Year Project - F25PROJECT9AEDE</h3>
      <hr />
      <h4>Technologies Used:</h4>
      <ul>
        <li>HTML5, CSS3 with Vanilla CSS</li>
        <li>React.js (Frontend)</li>
        <li>Next.js </li>
        <li>Node.js + Express (Backend API)</li>
        <li>MongoDB (Database)</li>
        <li>Mongoose (ODM)</li>
        <li>JWT (Authentication)</li>
        <li>bcryptjs (Password hashing)</li>
      </ul>
      <h4>Key Features:</h4>
      <ul>
        <li>Admin & Investor dashboards</li>
        <li>Property investment with share system</li>
        <li>Profit sharing (75% investor / 25% Hive)</li>
        <li>Withdrawal with loss protection</li>
        <li>PDF cheque generation</li>
        <li>Responsive design</li>
        <li>Contact form with admin response</li>
      </ul>
      <p><a href="http://localhost:3000">← Back to Main Site</a></p>
    </div>
  );
}