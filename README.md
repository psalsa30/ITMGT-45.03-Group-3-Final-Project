# Group-3-Core-E-Commerce-Build
ITMGT 45.03 YZW Group Final Project

## Business Concept
Many students often overspend on different products like clothes, supplies, gadgets, etc. while simultaneously wasting unused products. UniThrift offers 
the solution for this in the form of an efficient marketplace for students to buy and sell products, new or second hand, within their school community, 
making transactions easier and safer. The technology stack used supports quick MVP development, establishing a strong foundation for future scale and enhancements. 

| Layer            | Technology                              | Version                        | Purpose                          |
| ---------------- | --------------------------------------- | ------------------------------ | -------------------------------- |
| **Frontend**     | HTML5, CSS3, Vanilla JavaScript         | —                              | UI pages and cart logic          |
|                  | Chart.js                                | 4.x (via CDN)                  | Admin dashboard charts           |
| **Backend**      | Node.js + Express.js                    | Node v20+ / v25.x, Express 4.x | REST API for products and orders |
|                  | Prisma ORM                              | 5.22.0                         | Database ORM                     |
|                  | SQLite (file-based)                     | — (`prisma/dev.db`)            | Local database persistence       |
|                  | CORS middleware                         | 2.x                            | Cross-origin support             |
|                  | JSON Web Token (`jsonwebtoken`)         | 9.x                            | Authentication                   |
| **Database**     | JSON file (mock DB) OR Prisma SQLite DB | —                              | Order persistence (dev)          |
| **External API** | Zippopotam.us                           | —                              | Live ZIP → City lookup           |
| **Hosting**      | Netlify                                 | —                              | Frontend deployment              |
|                  | Render                                  | —                              | Backend deployment               |
| **Tooling**      | npm                                     | 10+                            | Package management               |
|                  | Prisma CLI                              | 5.22.0                         | Schema + migration tooling       |
|                  | Git + GitHub                            | —                              | Version control                  |

Deployment Link: https://courageous-licorice-2f94a2.netlify.app/ 

## Running the Backend
    cd server
    npm install
    node index.js
The backend runs at: http://localhost:8000

## Running the Frontend

    python3 -m http.server 3000
Frontend runs at: http://localhost:3000

## API Documentation
Base URL (Live): group-final-project-production.up.railway.app

### Endpoints
    GET /api/products
Returns a list of available products.

    POST /api/cart/checkout
Creates a mock order record.

    GET /api/orders
Returns all stored orders (from orders.json).

### Live API Integration
    Uses the Zippopotam.us API: GET https://api.zippopotam.us/ph/{ZIPCODE}

## List of Features:

Coupon feature

Add More

## SEO
Added meta tags: description, keywords, author, Open Graph data.
Mobile-responsive design (viewport tag).
Reduced inline script repetition, optimized DOM lookups.

### Before SEO
![before](image.png)

### After SEO
![after](image-1.png)

## Limitations

Uses a local JSON file for persistence (not a real database).

Authentication not implemented – all users share the same cart/order flow.

Render cold starts may cause a 5–10s delay on first backend load.

ZIP API occasionally fails for less common postal codes.
