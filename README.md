UserVault is a full-stack user data management system built with Node.js and Express.js on the backend, and pure HTML, CSS, and Vanilla JavaScript on the frontend — no UI frameworks, no ORMs, no bloat.
The backend exposes a clean RESTful API with six endpoints supporting full CRUD operations, server-side field validation, duplicate detection, and query-based filtering and sorting. Data is persisted to a JSON flat file, making the project fully self-contained and easy to swap in any real database (MongoDB, PostgreSQL, SQLite) with minimal changes.
The frontend is a single-page application with client-side routing, live form validation with field-level feedback, a searchable and filterable user directory, edit and delete modals, toast notifications, and a responsive layout that works across all screen sizes.

Tech Stack: Node.js · Express.js · REST API · Vanilla JS · HTML5 · CSS3




| **Backend** | Node.js · Express · RESTful API · File-based JSON store |
| **Frontend** | Vanilla JS SPA · Zero dependencies · Responsive |
| **CRUD** | Create · Read · Update · Delete (full lifecycle) |
| **Validation** | Client-side live validation + Server-side validation |
| **Search** | Real-time search by name, email, or job title |
| **Filtering** | Filter by gender · Sort by name or recency |
| **UI** | Dashboard with live stats · Edit modal · Delete confirmation |
| **UX** | Toast notifications · Loading states · Mobile responsive |
| **API** | JSON responses · Error handling · Duplicate detection |
