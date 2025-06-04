## Project Screencast
**Video Link**: https://www.youtube.com/watch?v=Qe1E_yEJAxU 

## Individual Oral Code Screencast
**Video Link (andli890)**: https://www.youtube.com/watch?v=Wo17Y9bJC1M  **Video Link (klaod937)**: https://www.youtube.com/watch?v=W12tbI5Kxo8 

## Functional and Technological Specification

### Functional Specification

**“PBL Meeting”** is a web application designed to facilitate weekly problem-based learning (PBL) sessions for a small student group (3–6 students) and their supervisor. It can help the IT-program students in the early years of their program who are required to participate in PBL meetings.
The goal is to provide an interactive, real-time platform where students can have structured meetings  - from sharing the weekly problem case to collaboratively brainstorming and recording outcomes. By integrating all necessary tools (role assignment, document sharing, live note-taking) into one application, the system encourages equal participation and eliminates having a mess of external tools like Messenger or Google Drive. It promotes engagement through rotating roles like Chairman and Secretary, and ensures that each session’s notes and decisions are saved.

#### Core Functionalities of the System

- **Authentication**: Users log in securely using Google Authentication via Firebase.

#### Meeting Lobby

- Users can create or join meeting rooms using unique meeting IDs.
- A global chat is available on the left side of both the Login and Lobby views.
- Logged-in users can post messages; others can only view.
- Useful for communication and sharing meeting IDs.

#### Meeting Room (Waiting View)

- Displays all participants in real-time as they join.
- The meeting creator (Supervisor) has special privileges:
  - Can upload a PDF/image file ("vinjett" assignment).
  - Can start the meeting once all participants have joined.
- When the meeting starts:
  - A wheel spinner animation assigns the roles of Chairman and Secretary (excluding the supervisor).
  - All participants are automatically redirected to the active meeting view after the animation finishes.

#### Active Meeting View

- Left pane shows the uploaded Vinjett document.
- Right pane is a live collaborative note area, editable only by the assigned Secretary.
- Both the notes and the assigned Secretary role are synced in real-time for all users.

---




### Technological Specification

#### Frontend (User Interface)

- **React** (library/framework) with **TypeScript** (language) is used to build all interactive pages.
- **Tailwind CSS** (framework) helps style everything quickly and consistently.
- A **dark mode toggle** is available on all pages using Tailwind’s dark mode support.

#### Routing & Authentication

- **React Router** handles page navigation:
  - `/login`
  - `/lobby`
  - `/meeting/:id`
  - `/meeting/:id/active`
- **Firebase Authentication** is used for secure login via Google.
- The login status is tracked globally using `onAuthStateChanged`.

#### Serverless Backend & Real-time Data

- **Firebase Firestore** is used to store meeting data like participants, roles, and live notes.
- Firestore’s `onSnapshot` enables real-time updates across all connected clients.
- **Firebase Storage** is used to upload and store PDF or image files (the “vinjett”).
- The uploaded Vinjett is displayed using an `<iframe>` sourced from its Firebase Storage public URL.

---

### Extra Tools

- **React Toastify** – Displays real-time success/error messages (e.g., after uploading or starting a meeting).
- **jsPDF** – Generates and downloads meeting notes as `.pdf` files after a meeting ends.
- **Tailwind Dark Mode** – Enables toggleable dark/light theme across all views.
- **Lucide Icons** – Used for UI icons like the light bulb theme toggle.

---

### Firebase Architecture

The frontend (React) communicates directly with Firebase’s client SDKs.  
- **Authentication** and **file uploads** use REST-based APIs under the hood.  
- **Firestore** handles real-time database syncing through a **WebSocket-based protocol**.  
Each Firebase module operates independently and integrates into the app’s architecture.

