import Card from "../components/Card";
import "../styles/screens/SettingsScreen.css";

export default function SettingsScreen() {
  return (
    <div className="settings-screen">
      <Card title="System Settings">
        <form className="settings-form" onSubmit={(e)=>e.preventDefault()}>
          <label>
            Office open time
            <input type="time" defaultValue="08:00" />
          </label>

          <label>
            Office close time
            <input type="time" defaultValue="17:00" />
          </label>

          <label>
            Notification email
            <input type="email" placeholder="registrar@uph.edu" />
          </label>

          <div className="form-actions">
            <button className="btn-primary">Save Settings</button>
            <button className="btn-ghost" type="button">Reset</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
