create table user_details (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  last_name text not null,
  position text not null,
  branch text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table admin (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table queues (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  queue_number serial,
  username text not null,
  status_teambuild text default 'waiting',
  status_party text default 'waiting',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


alter table user_details enable row level security;
alter table admin enable row level security;
alter table queues enable row level security;


-- 5. สร้างฟังก์ชันเช็กสิทธิ์ Admin แบบยิงตรง (Bypass RLS เพื่อแก้ Infinite Loop)
create or replace function check_is_admin()
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.admin
    where id = auth.uid()
  );
end;
$$ language plpgsql;

-- กฎ (Policies) สำหรับ User ทั่วไป (Anonymous)
create policy "Users can manage their own details"
  on user_details for all
  using (auth.uid() = id);

create policy "Users can manage their own queues"
  on queues for all
  using (auth.uid() = user_id);

-- กฎ (Policies) สำหรับ Admin หน้างาน
create policy "Admins can view all details"
  on user_details for select
  using ( check_is_admin() );

create policy "Admins can manage all queues"
  on queues for all
  using ( check_is_admin() );

create policy "Admins can manage their own admin data"
  on admin for all
  using (auth.uid() = id);