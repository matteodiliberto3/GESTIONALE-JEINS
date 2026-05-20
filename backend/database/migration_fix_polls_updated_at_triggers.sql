-- Ripristina trigger updated_at su DB che hanno applicato migration_event_reports_and_polls
-- senza CREATE TRIGGER (idempotente)

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_event_reports_updated_at ON event_reports;
CREATE TRIGGER update_event_reports_updated_at
    BEFORE UPDATE ON event_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scheduling_polls_updated_at ON scheduling_polls;
CREATE TRIGGER update_scheduling_polls_updated_at
    BEFORE UPDATE ON scheduling_polls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
