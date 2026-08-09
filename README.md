# lost and found

A web application that helps campus communities report, search for, and recover lost items. Students and staff can post items they've lost or found, browse the board with real-time filters, and mark items as claimed by posting the received item when reunited with their owner.

---

## Tech Stack

| **React 18** | UI library |
| **Vite** | Build tool / dev server |
| **Tailwind CSS v3** | Utility-first styling |
| **Supabase** | Database (PostgreSQL) + image storage |
| **React Router v6** | Client-side routing |

### Why this stack?

- **React 18** — *it easy to build web apps with react and has  many functions that can be reused.*
- **Vite** — *best for development and build*
- **Tailwind CSS** — *best tool for creating and cutomizing colours and layout. *
- **Supabase** — *best for using as backend databases.*
- **React Router** — *lets user navigate to pages.*

---

## Features

- **Report** lost or found items with photo upload, category, location, and contact info
- **Browse** the board with a responsive card grid (1–4 columns)
- **Filter** by type (lost/found), category, location, and status
- **Search** titles and descriptions with debounced text input
- **View** full item details with all fields and reporter info
- **Edit** any item (same form, pre-filled)
- **Claim / Reopen** items with a confirmation dialog and **Photo Verification**
- **Delete** items permanently (removes photo from storage too)
- Loading skeletons, error states with retry, and empty states throughout

---



## Challenges Faced
- i faced challenge in the website deployment and all the backend databasec with supabase image storage.

## Improvement
- we could use ai for better confirmation of received item so that the item which has been already found or given can be deleated from the database automatically, so we can save space or keep a written record of who took and when.



