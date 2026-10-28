# Contact Management System – Backend

Node.js + Express + MongoDB (Mongoose) + JWT. Built to work with the React frontend.

## Setup

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
# edit .env: set MONGO_URI and a long random JWT_SECRET
npm run seed             # creates the admin account + starter categories
npm run dev              # starts the API on http://localhost:5000
```

Check it works: open http://localhost:5000/api/health → `{"status":"ok"}`.

Default admin (from .env): admin@example.com / admin123. Change it.

## Endpoints

| Method | Route                     | Access        |
|--------|---------------------------|---------------|
| POST   | /api/auth/register        | Public        |
| POST   | /api/auth/login           | Public        |
| GET    | /api/contacts             | User (own)    |
| GET    | /api/contacts/:id         | User (own)    |
| POST   | /api/contacts             | User          |
| PUT    | /api/contacts/:id         | User (own)    |
| DELETE | /api/contacts/:id         | User (own)    |
| GET    | /api/categories           | Any signed in |
| POST   | /api/categories           | Admin         |
| PUT    | /api/categories/:id       | Admin         |
| DELETE | /api/categories/:id       | Admin         |
| GET    | /api/users                | Admin         |
| GET    | /api/users/:id            | Self / Admin  |
| PUT    | /api/users/:id            | Self / Admin  |
| DELETE | /api/users/:id            | Admin         |

Rules enforced: passwords hashed with bcrypt; users can only touch their own contacts;
only admins can change roles or deactivate users; categories in use can't be deleted;
admins can't delete, demote, or deactivate themselves; deleting a user removes their contacts.

## Added in v2
- Contacts accept an optional `photo` (small JPEG/PNG/WebP data URL, about 200 KB max).
- `GET /api/categories` includes `contactCount` for admins.
- Changing your own password via `PUT /api/users/:id` requires `currentPassword`.
- JSON body limit raised to 1 MB for photos.
