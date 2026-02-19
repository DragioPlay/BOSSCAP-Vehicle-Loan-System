CREATE OR REPLACE FUNCTION set_start_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.start_date = NEW.start_date::date + '20:00:00'::time;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_start_date
BEFORE INSERT OR UPDATE ON booking
FOR EACH ROW
EXECUTE FUNCTION set_start_date();