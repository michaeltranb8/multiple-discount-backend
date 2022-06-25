# Promo App Backend

## Deployment

### Note

- The Shopify app should be a **public app** and **is a sales channel**.
- To run the app, you need to active both `frontend` and `backend` app, then install the promotion app to development store to work with it
- Frontend and backend need to run on different port. Example: if frontend run on port 3000, backend need run on port 3001
- After run frontend and backend on local, you need to run **local tunnel** command to make both public to internet so we can connect with Shopify

**Requirements:**

- Node.js (>= 14)
- PostgreSQL (>= 13)

---

## Setup steps

Before do these steps, you need create a public Shopify app on your Shopify partner account and copy `API key` and `Secret key` to then update on `env` file

**1. Install **local tunnel** to public the app to internet** (if you haven't install)

```
npm install -g localtunnel
```

**2. Copy `.env` to `.env.local` and edit it to fit your development environment**

```
# The database URL
TYPEORM_URL=postgres://your_db_username:your_db_password@localhost/promo_backend

# These should not be modified but they are necessary
TYPEORM_ENTITIES=src/entities/*.ts
TYPEORM_MIGRATIONS=src/migrations/*.ts
TYPEORM_SUBSCRIBERS=src/subscribers/*.ts
TYPEORM_ENTITIES_DIR=src/entities
TYPEORM_MIGRATIONS_DIR=src/migrations
TYPEORM_SUBSCRIBERS_DIR=src/subscribers

# These can be obtained from Shopify App settings
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_SECRET=your_shopify_api_secret_key
SHOPIFY_REDIRECT_URI=your_local_tunnel_back_end_link/auth/callback

# The frontend root url
SHOPIFY_RETURN_URI=your_local_tunnel_front_end_link
SHOPIFY_TEST=true
PROMO_API_HOST=your_local_tunnel_back_end_link

# This should be random generated and be shared across the whole environment
JWT_SECRET=28de5c832e9c2a0816cbf13b732e3180c4d02973e6b59f4c75118cecd67653f797b9b88dbbc3b27c17bf9c1033adc51e982f25e5b556b1883ecf4664ded5e07c
PORT=3001
```

**3. Download and install postgres: `https://www.postgresql.org/download/`**

And then run:

```
createdb promo_backend
yarn typeorm-dev migration:run
```

**4. Run the app on local**

```
yarn dev
```

**5. Run local tunnel to public the app**

```
lt --port 3001 --subdomain abc-be
```

---

## For Test

Copy `.env.test` to `.env.test.local` and edit it to fit your test environment, and then run:

```
createdb promo_backend_test
yarn typeorm-test migration:run
```

Run test:

```
yarn test
# or
yarn watch
```

---

**Addition:**
Only run this if you using dokku server - Update app via git

```
git push dokku remaster:master
```
