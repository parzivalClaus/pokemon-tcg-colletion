-- Run once in the Supabase SQL Editor. Keeps the oldest copy of each card
-- for every user. Review before running: redundant rows will be deleted.
begin;

lock table public.user_cards in share row exclusive mode;

with ranked as (
  select ctid,
    row_number() over (
      partition by user_id, pokemon_id
      order by created_at asc nulls last, ctid
    ) as copy_number
  from public.user_cards
)
delete from public.user_cards as cards
using ranked
where cards.ctid = ranked.ctid and ranked.copy_number > 1;

create unique index if not exists user_cards_user_id_pokemon_id_unique
  on public.user_cards (user_id, pokemon_id);

commit;
