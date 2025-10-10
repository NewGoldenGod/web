/*
  # Create siniestros table

  ## Overview
  Creates the main table for storing vehicle insurance claims (siniestros) with full audit trail and security.

  ## New Tables
  - `siniestros`
    - `id` (uuid, primary key) - Unique identifier for each claim
    - `rut` (text) - Chilean national ID of the insured person
    - `numero_poliza` (text) - Insurance policy number
    - `tipo_seguro` (text) - Type of damage (Colisión, Robo, Incendio, Vandalismo)
    - `vehiculo` (text) - Vehicle type (Auto, Camioneta, Moto, Camión)
    - `email` (text) - Contact email
    - `telefono` (text) - Contact phone
    - `estado` (text) - Current status (Ingresado, En Evaluación, Finalizado)
    - `liquidador` (text) - Assigned claims adjuster
    - `grua` (text) - Assigned tow truck company
    - `taller` (text) - Assigned repair shop
    - `usuario_tipo` (text) - User type who created the claim (admin or cliente)
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `siniestros` table
  - Admins can view, create, update all siniestros
  - Clients can view only their own siniestros (by RUT)
  - Clients can create siniestros

  ## Important Notes
  - All claims start with estado = 'Ingresado'
  - Liquidador, grua, and taller are assigned automatically or randomly
  - RUT format expected: 12345678-9
*/

CREATE TABLE IF NOT EXISTS siniestros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rut text NOT NULL,
  numero_poliza text NOT NULL,
  tipo_seguro text NOT NULL,
  vehiculo text NOT NULL,
  email text NOT NULL,
  telefono text NOT NULL,
  estado text NOT NULL DEFAULT 'Ingresado',
  liquidador text,
  grua text,
  taller text,
  usuario_tipo text DEFAULT 'cliente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE siniestros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all siniestros"
  ON siniestros
  FOR SELECT
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Clients can view own siniestros"
  ON siniestros
  FOR SELECT
  TO authenticated
  USING (
    rut = (SELECT raw_user_meta_data->>'rut' FROM auth.users WHERE id = auth.uid())
    OR (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can create siniestros"
  ON siniestros
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Clients can create own siniestros"
  ON siniestros
  FOR INSERT
  TO authenticated
  WITH CHECK (
    rut = (SELECT raw_user_meta_data->>'rut' FROM auth.users WHERE id = auth.uid())
    OR (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update siniestros"
  ON siniestros
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete siniestros"
  ON siniestros
  FOR DELETE
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'user_type' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_siniestros_rut ON siniestros(rut);
CREATE INDEX IF NOT EXISTS idx_siniestros_numero_poliza ON siniestros(numero_poliza);
CREATE INDEX IF NOT EXISTS idx_siniestros_estado ON siniestros(estado);
CREATE INDEX IF NOT EXISTS idx_siniestros_created_at ON siniestros(created_at DESC);