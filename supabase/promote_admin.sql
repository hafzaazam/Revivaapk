-- Promote the shop admin (run after creating the Auth user)
-- Email: Admin@gmail.com  Password: 123123

-- 1) Ensure profile row exists + role = admin
insert into public.profiles (id, full_name, role)
select u.id, coalesce(u.raw_user_meta_data->>'full_name', 'Admin'), 'admin'
from auth.users u
where lower(u.email) = 'admin@gmail.com'
on conflict (id) do update
set role = 'admin';

-- 2) Sanity check — should return 1 row with role = admin
select u.email, p.id, p.role
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = 'admin@gmail.com';
