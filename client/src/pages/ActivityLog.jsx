import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { DashboardLayout } from './PolicySettings';

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/logs').then(({ data }) => setLogs(data)); }, []);
  return <DashboardLayout title="Activity log" kicker="YOUR GUARD / 02"><p className="intro">A private record of decisions made by your guard. Evidence images are blurred before storage.</p><div className="table-wrap"><table><thead><tr><th>Evidence</th><th>Where</th><th>Category</th><th>Decision</th><th>Time</th></tr></thead><tbody>{logs.map((log, index) => <tr key={`${log.timestamp}-${index}`}><td>{log.imageData ? <img src={log.imageData} alt="Blurred evidence" style={{ display: 'block', width: 86, height: 50, objectFit: 'cover', border: '1px solid #c9c4b8' }} /> : <span>{log.evidenceStatus === 'unavailable' ? 'Evidence unavailable' : 'No image'}</span>}</td><td><strong>{log.domain}</strong><br /><small>{log.pageTitle || log.field || 'Protected page'}</small></td><td>{log.category.replace('_', ' ')}</td><td><span className={`status ${log.decision}`}>{log.decision}</span></td><td>{new Date(log.timestamp).toLocaleString()}</td></tr>)}</tbody></table>{logs.length === 0 && <p className="empty">No decisions recorded yet.</p>}</div></DashboardLayout>;
}
