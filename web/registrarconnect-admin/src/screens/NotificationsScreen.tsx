import Card from "../components/Card";
export default function NotificationsScreen() {
  const items = [
    { text: "Payment receipt REQ-1043 verified", unread:true },
    { text: "New appointment booked: Hans Lee Langit", unread:false },
  ];

  return (
    <div className="notifications-screen">
      <Card title="Notifications">
        <ul className="notify-list">
          {items.map((n, i) => (
            <li key={i} className={n.unread ? "notify-item unread" : "notify-item"}>
              <div className="notify-text">{n.text}</div>
              <div className="small-muted">2 hours ago</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
