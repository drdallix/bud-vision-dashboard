
-- Create a function to update strain descriptions in the scans table
CREATE OR REPLACE FUNCTION public.update_strain_description(
  p_strain_id uuid,
  p_description text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_strain record;
BEGIN
  -- Check if user owns the strain
  IF NOT EXISTS (
    SELECT 1 FROM scans 
    WHERE id = p_strain_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Strain not found or access denied';
  END IF;

  -- Update the strain description
  UPDATE scans 
  SET 
    description = p_description,
    created_at = created_at -- Keep original created_at unchanged
  WHERE id = p_strain_id AND user_id = p_user_id
  RETURNING * INTO updated_strain;

  -- Return the updated strain data
  RETURN json_build_object(
    'success', true,
    'strain', row_to_json(updated_strain)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_strain_description TO authenticated;
