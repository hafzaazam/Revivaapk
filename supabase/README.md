# Supabase setup (guest shop + admin panel)

## 1. Env

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_ADMIN_EMAIL=Admin@gmail.com
```

Restart Vite after saving.

## 2. Database

Run [`schema.sql`](./schema.sql) in **SQL Editor**.

Optional extra migrations (in order, each after `schema.sql`):

| File | Adds |
| --- | --- |
| [`reviews_schema.sql`](./reviews_schema.sql) | Influencer reviews + media storage + moderation RPCs |
| [`vouchers_schema.sql`](./vouchers_schema.sql) | Vouchers (`FRIEND10`, `FLAT200` seeds), redemption ledger, `validate_voucher`, checkout discount |
| [`admin_dashboard.sql`](./admin_dashboard.sql) | Analytics RPCs: sales/revenue trends, product/voucher/city/province/category breakdowns, and repeat-customer (customer return) tracking |
| [`realtime.sql`](./realtime.sql) | Live “new order” alerts in the admin (Realtime publication for `orders`). Safe to re-run |

Realtime is the instant channel; the admin panel has a 30s polling fallback that works even without it.

## 3. Create admin user

1. Supabase → **Authentication → Users → Add user**
2. Email: `Admin@gmail.com`
3. Password: `123123`
4. Turn **ON** “Auto Confirm User”
5. Run [`promote_admin.sql`](./promote_admin.sql) in the SQL Editor

Then open `/admin/login` and sign in. Restart `npm run dev` after any `.env` change.

### If login fails

| Message | Fix |
| --- | --- |
| Invalid login | User does not exist — Add user in Auth |
| Email not confirmed | Confirm user in Auth, or disable Confirm email |
| Not admin / bounce to login | Run `promote_admin.sql` + hard refresh |

## 4. Routes

| Path | Who |
| --- | --- |
| `/checkout` | Anyone (no account) |
| `/admin/login` | Admin sign-in |
| `/admin` | Overview (stats + charts + customer returns) + orders/products/categories/reviews/vouchers |

Shoppers never need an account. Only admin uses Auth.
