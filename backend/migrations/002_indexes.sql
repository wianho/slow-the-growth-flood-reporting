CREATE INDEX idx_reports_location ON flood_reports USING GIST(location);
CREATE INDEX idx_reports_created ON flood_reports(created_at DESC);
CREATE INDEX idx_reports_expires ON flood_reports(expires_at);
CREATE INDEX idx_reports_fingerprint ON flood_reports(device_fingerprint);
CREATE INDEX idx_archive_created ON flood_reports_archive(created_at DESC);
CREATE INDEX idx_audit_report ON audit_log(report_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
