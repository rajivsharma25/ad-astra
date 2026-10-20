-- Run this only when upgrading a database created with the earlier Phase 5 schema.
-- Fresh projects should run schema.sql instead.

alter table public.documents add column if not exists excerpt text not null default '';
alter table public.documents add column if not exists local_only boolean not null default false;

-- Remove either the original single-column or the composite message relationship
-- before replacing the conversations primary key.
alter table public.messages drop constraint if exists messages_conversation_id_fkey;
alter table public.messages drop constraint if exists messages_user_id_conversation_id_fkey;
alter table public.messages drop constraint if exists messages_conversation_fk;

alter table public.conversations drop constraint if exists conversations_pkey;
alter table public.conversations add constraint conversations_pkey primary key (user_id, id);

alter table public.messages drop constraint if exists messages_pkey;
alter table public.messages add constraint messages_pkey primary key (user_id, id);
alter table public.messages
  add constraint messages_conversation_fk
  foreign key (user_id, conversation_id)
  references public.conversations (user_id, id)
  on delete cascade;

alter table public.documents drop constraint if exists documents_pkey;
alter table public.documents add constraint documents_pkey primary key (user_id, id);

alter table public.prompts drop constraint if exists prompts_pkey;
alter table public.prompts add constraint prompts_pkey primary key (user_id, id);
