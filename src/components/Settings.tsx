import { useState } from 'react';
import { AppConfig } from '../lib/storage';
import { signIn } from '../lib/google';

interface Props {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
  connected: boolean;
}

export default function Settings({ config, onChange, connected }: Props) {
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState('');

  function update<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  async function testSignIn() {
    setTesting(true);
    setMsg('');
    try {
      await signIn(config.googleClientId);
      setMsg('✅ Signed in successfully.');
    } catch (e) {
      setMsg(`❌ ${(e as Error).message}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="card form">
      <h2>Google Sheets</h2>
      <p className="muted">
        Status:{' '}
        {connected ? (
          <strong className="ok">Connected</strong>
        ) : (
          <strong className="warn">Not connected</strong>
        )}
      </p>

      <label>
        Google OAuth Client ID
        <input
          type="text"
          placeholder="xxxxxx.apps.googleusercontent.com"
          value={config.googleClientId}
          onChange={(e) => update('googleClientId', e.target.value.trim())}
        />
      </label>

      <label>
        Spreadsheet ID
        <input
          type="text"
          placeholder="from the sheet URL: /d/<THIS>/edit"
          value={config.spreadsheetId}
          onChange={(e) => update('spreadsheetId', e.target.value.trim())}
        />
      </label>

      <label>
        Sheet/tab name
        <input
          type="text"
          value={config.sheetName}
          onChange={(e) => update('sheetName', e.target.value.trim() || 'Records')}
        />
      </label>

      <button className="primary" onClick={testSignIn} disabled={testing}>
        {testing ? 'Connecting…' : 'Test Google sign-in'}
      </button>
      {msg && <p className="muted">{msg}</p>}

      <details className="help">
        <summary>How to set up (one time)</summary>
        <ol>
          <li>Create a Google Sheet; copy its ID from the URL.</li>
          <li>Add a tab named exactly as above (default “Records”).</li>
          <li>
            In Google Cloud Console: enable the <em>Google Sheets API</em>, create an
            OAuth client ID (type: Web), and add this app’s URL to “Authorized
            JavaScript origins”.
          </li>
          <li>Paste the Client ID and Spreadsheet ID here, then Sync.</li>
        </ol>
      </details>
    </div>
  );
}
