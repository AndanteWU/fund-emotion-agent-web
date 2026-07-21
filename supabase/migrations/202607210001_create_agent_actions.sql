begin;

create table public.agent_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  review_id uuid not null,
  pattern_type text not null,
  observation_title text not null,
  observation_evidence jsonb not null default '[]'::jsonb,
  source_start_date date not null,
  source_end_date date not null,
  action_title text not null,
  action_instruction text not null,
  status text not null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  feedback_due_at timestamptz,
  last_prompted_at timestamptz,
  feedback text,
  feedback_at timestamptz,
  updated_at timestamptz not null default now(),

  constraint agent_actions_user_review_unique unique (user_id, review_id),
  constraint agent_actions_pattern_type_check check (
    pattern_type in (
      'rising_anxiety',
      'frequent_checking',
      'emotion_action_link',
      'no_clear_pattern'
    )
  ),
  constraint agent_actions_status_check check (
    status in ('accepted', 'declined', 'completed')
  ),
  constraint agent_actions_feedback_check check (
    feedback is null
    or feedback in ('helpful', 'not_helpful', 'not_tried')
  ),
  constraint agent_actions_evidence_array_check check (
    jsonb_typeof(observation_evidence) = 'array'
  ),
  constraint agent_actions_source_date_range_check check (
    source_end_date >= source_start_date
  ),
  constraint agent_actions_state_check check (
    (
      status = 'accepted'
      and accepted_at is not null
      and feedback_due_at is not null
      and feedback is null
      and feedback_at is null
    )
    or (
      status = 'declined'
      and accepted_at is null
      and feedback_due_at is null
      and last_prompted_at is null
      and feedback is null
      and feedback_at is null
    )
    or (
      status = 'completed'
      and accepted_at is not null
      and feedback_due_at is not null
      and feedback is not null
      and feedback_at is not null
    )
  ),
  constraint agent_actions_feedback_due_check check (
    feedback_due_at is null
    or feedback_due_at >= accepted_at + interval '24 hours'
  )
);

create unique index agent_actions_one_accepted_per_user_idx
  on public.agent_actions (user_id)
  where status = 'accepted';

create or replace function public.set_agent_actions_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agent_actions_set_updated_at
before update on public.agent_actions
for each row
execute function public.set_agent_actions_updated_at();

alter table public.agent_actions enable row level security;

create policy agent_actions_select_own
on public.agent_actions
for select
to authenticated
using (auth.uid() = user_id);

create policy agent_actions_insert_own
on public.agent_actions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy agent_actions_update_own
on public.agent_actions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

revoke all on table public.agent_actions from anon;
revoke all on table public.agent_actions from authenticated;
grant select, insert, update on table public.agent_actions to authenticated;

commit;
