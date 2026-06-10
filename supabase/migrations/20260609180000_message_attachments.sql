-- Миграция: таблица вложений для сообщений + Storage bucket
-- Создаёт таблицу message_attachments, RLS политики и bucket chat-files

-- 1. Storage bucket для файлов чата
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-files',
  'chat-files',
  false,
  52428800, -- 50 MB
  array[
    'image/jpeg','image/png','image/webp','image/gif','image/svg+xml',
    'audio/mpeg','audio/ogg','audio/wav','audio/webm','audio/aac','audio/flac',
    'video/mp4','video/webm','video/ogg','video/quicktime',
    'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain','text/csv','application/zip','application/x-rar-compressed',
    'application/json','application/xml'
  ]
)
on conflict (id) do nothing;

-- 2. Таблица вложений
create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  created_at timestamptz not null default now()
);

-- Индекс для быстрой загрузки вложений сообщения
create index if not exists idx_message_attachments_message_id on public.message_attachments(message_id);

-- 3. RLS
alter table public.message_attachments enable row level security;

-- Вставка — только автор сообщения (проверка через sender_id в messages)
create policy "sender can insert attachments"
on public.message_attachments
for insert
to authenticated
with check (
  exists (
    select 1 from public.messages
    where messages.id = message_attachments.message_id
    and messages.sender_id = auth.uid()
  )
);

-- Чтение — участники диалога
create policy "participants can view attachments"
on public.message_attachments
for select
to authenticated
using (
  exists (
    select 1 from public.messages
    where messages.id = message_attachments.message_id
    and (
      messages.sender_id = auth.uid()
      or messages.recipient_id = auth.uid()
    )
  )
);

-- Удаление — только автор сообщения
create policy "sender can delete attachments"
on public.message_attachments
for delete
to authenticated
using (
  exists (
    select 1 from public.messages
    where messages.id = message_attachments.message_id
    and messages.sender_id = auth.uid()
  )
);

-- 4. Storage RLS
create policy "authenticated users can upload files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'chat-files'
);

create policy "participants can read files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'chat-files'
);

create policy "sender can delete own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'chat-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);