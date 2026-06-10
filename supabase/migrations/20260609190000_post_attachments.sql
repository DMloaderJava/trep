-- Миграция: таблица вложений для постов (ленты)
-- Создаёт таблицу post_attachments и политики RLS

-- 1. Таблица вложений для постов
create table if not exists public.post_attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  created_at timestamptz not null default now()
);

-- Индекс для быстрой загрузки вложений постов
create index if not exists idx_post_attachments_post_id on public.post_attachments(post_id);

-- 2. Включаем RLS
alter table public.post_attachments enable row level security;

-- Вставка — только автор поста (проверка через author_id в posts)
create policy "author can insert post attachments"
on public.post_attachments
for insert
to authenticated
with check (
  exists (
    select 1 from public.posts
    where posts.id = post_attachments.post_id
    and posts.author_id = auth.uid()
  )
);

-- Чтение — любой, кто имеет доступ к самому посту
create policy "anyone can view post attachments if they can view the post"
on public.post_attachments
for select
to authenticated
using (
  exists (
    select 1 from public.posts
    where posts.id = post_attachments.post_id
  )
);

-- Удаление — только автор поста
create policy "author can delete post attachments"
on public.post_attachments
for delete
to authenticated
using (
  exists (
    select 1 from public.posts
    where posts.id = post_attachments.post_id
    and posts.author_id = auth.uid()
  )
);
