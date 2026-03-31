# 🎓 Campus Connect

**Campus Connect** is a comprehensive student collaboration platform designed to bridge the gap between students, alumni, and campus resources. It provides a unified ecosystem for project collaboration, mentorship, academic resource sharing, and campus event management.

## 🚀 Features

### 1. 🧭 Project Compass
Collaborate on academic projects and build your portfolio.
* **Create Projects:** Students can post project ideas with required skills.
* **Team Formation:** Users can apply to join teams, and owners can manage applications (Accept/Reject).
* **Role-Based Actions:** Project owners have exclusive controls (Delete, Manage Team), while applicants can view and join.
* **Smart Notifications:** Real-time alerts for join requests.

### 2. 🎓 Mentorship Program
Connect current students with experienced alumni.
* **Dual Roles:** Separate dashboards for **Students** and **Alumni**.
* **Alumni Onboarding:** Alumni can create profiles highlighting their expertise, company, and help areas.
* **Request System:** Students can browse mentors and send specific requests (Career Guidance, Referrals, etc.).
* **Status Tracking:** Track request status (Pending, Accepted, Rejected) in real-time.

### 3. 💬 Doubt Desk
A peer-to-peer Q&A forum.
* **Ask & Answer:** Students can post academic doubts and receive answers from peers.
* **Community Driven:** Foster a culture of knowledge sharing.

### 4. 📚 Resource Hub
A centralized repository for study materials.
* **Upload/Download:** Share notes, question papers, and study guides.
* **Search & Filter:** Find resources by subject, semester, or college.

### 5. 📅 Campus Events
Stay updated with university happenings.
* **Event Calendar:** View upcoming workshops, seminars, and club activities.
* **Filtering:** Filter events by category (Academic, Sports, Cultural) or date.

### 6. 💬 Real-Time Chat
* **WebSocket Integration:** Instant messaging between students and mentors once a connection is established.
* **WhatsApp-style UI:** Modern, responsive chat interface with history support.

---

## 🛠️ Tech Stack

### Frontend
* **HTML5 & CSS3:** Modern, responsive design with **Glassmorphism** effects.
* **JavaScript (ES6+):** Dynamic DOM manipulation, Fetch API for backend communication.
* **Theme Support:** Built-in **Dark Mode / Light Mode** toggle with local storage persistence.

### Backend
* **Java Spring Boot:** RESTful API architecture.
* **Spring Data JPA:** Database interaction and object-relational mapping.
* **WebSocket (Stomp/SockJS):** Real-time bi-directional communication for chat.
* **Database:** (MySQL / PostgreSQL / H2 - *Update based on your config*)

---

## ⚙️ Installation & Setup

### Prerequisites
* Java JDK 17+
* Maven
* Postgresql

### Backend Setup
1.  Clone the repository:
    ```bash
    git clone [https://github.com/yourusername/campus-connect.git](https://github.com/yourusername/campus-connect.git)
    ```
2.  Navigate to the backend directory and configure `src/main/resources/application.properties` with your database credentials.
3.  Run the application:
    ```bash
    mvn spring-boot:run
    ```
4.  The server will start at `http://localhost:8080`.

### Frontend Setup
1.  The frontend is designed to be served statically or via the Spring Boot `static` resources folder.
2.  Open `index.html` or `login.html` in your browser (or access via `http://localhost:8080/login.html` if integrated).

---

## 📂 Project Structure

```bash
campus-connect/
├── src/
│   ├── main/
│   │   ├── java/com/campusconnect/
│   │   │   ├── ProjectCompass/      # Project logic
│   │   │   ├── Mentorship/          # Mentorship logic
│   │   │   └── ...
│   │   └── resources/
│   │       ├── static/              # HTML, CSS, JS files
│   │       └── application.properties
└── pom.xml
