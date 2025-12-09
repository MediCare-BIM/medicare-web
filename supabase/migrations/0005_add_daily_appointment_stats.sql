CREATE OR REPLACE FUNCTION get_daily_appointment_stats()
RETURNS TABLE(daily_average numeric, total_today bigint, high_priority_today bigint) AS $$
BEGIN
    RETURN QUERY
    WITH daily_counts AS (
        SELECT
            CAST(appointment_date AS DATE) AS app_date,
            COUNT(id) AS daily_count
        FROM appointments
        GROUP BY app_date
    ),
    todays_appointments AS (
        SELECT
            id,
            priority
        FROM appointments
        WHERE CAST(appointment_date AS DATE) = CAST(CURRENT_DATE AS DATE)
    )
    SELECT
        (SELECT AVG(daily_count) FROM daily_counts WHERE app_date != CURRENT_DATE),
        (SELECT COUNT(id) FROM todays_appointments),
        (SELECT COUNT(id) FROM todays_appointments WHERE priority = 'High');
END;
$$ LANGUAGE plpgsql;
