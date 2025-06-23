-- Webhook monitoring and logging tables
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  
  INDEX idx_webhook_events_processor (processor),
  INDEX idx_webhook_events_processed (processed),
  INDEX idx_webhook_events_created_at (created_at)
);

-- Webhook processing logs
CREATE TABLE IF NOT EXISTS webhook_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id UUID REFERENCES webhook_events(id),
  processing_status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'retry'
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_webhook_logs_event_id (webhook_event_id),
  INDEX idx_webhook_logs_status (processing_status)
);

-- Function to clean up old webhook events (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM webhook_events 
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND processed = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run daily)
-- Note: This requires pg_cron extension
-- SELECT cron.schedule('cleanup-webhooks', '0 2 * * *', 'SELECT cleanup_old_webhook_events();');
