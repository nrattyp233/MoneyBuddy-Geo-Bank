-- Create helper function to get table list
CREATE OR REPLACE FUNCTION get_table_list()
RETURNS TABLE(table_name text, row_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    COALESCE(
      (SELECT count(*) FROM information_schema.tables WHERE table_name = t.table_name),
      0
    ) as row_count
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE';
END;
$$;

-- Create version function if it doesn't exist
CREATE OR REPLACE FUNCTION version()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT version();
$$;
