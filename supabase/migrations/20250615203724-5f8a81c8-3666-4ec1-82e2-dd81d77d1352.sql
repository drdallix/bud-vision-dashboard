
-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.enforce_preset_prices() 
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  if NEW.now_price not in (30,40,50,60,80,100,120,200,300) then
    raise exception 'Invalid now_price, must be in (30,40,50,60,80,100,120,200,300)';
  end if;
  if NEW.was_price is not null and NEW.was_price not in (30,40,50,60,80,100,120,200,300) then
    raise exception 'Invalid was_price, must be in (30,40,50,60,80,100,120,200,300)';
  end if;
  return NEW;
end;
$$;
