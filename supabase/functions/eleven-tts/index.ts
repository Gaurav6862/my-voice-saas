create or replace function try_consume_credits(user_uuid uuid, amount int)
returns boolean language plpgsql as $$
declare bal int;
begin
  select balance into bal from credits where user_id = user_uuid for update;
  if bal is null then return false; end if;
  if bal < amount then return false; end if;
  update credits set balance = balance - amount, updated_at = now() where user_id = user_uuid;
  return true;
end;
$$;
