
create or replace function get_daily_appointment_average()
returns float as $$
declare
  total_appointments int;
  distinct_days int;
begin
  select count(*), count(distinct(date_trunc('day', appointment_date)))
  into total_appointments, distinct_days
  from appointments;

  if distinct_days = 0 then
    return 0;
  end if;

  return total_appointments::float / distinct_days::float;
end;
$$ language plpgsql;
