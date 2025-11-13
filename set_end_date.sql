CREATE OR REPLACE FUNCTION set_end_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.end_date = NEW.end_date::date + '20:00:00'::time;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_end_date
BEFORE INSERT OR UPDATE ON booking
FOR EACH ROW
EXECUTE FUNCTION set_end_date();