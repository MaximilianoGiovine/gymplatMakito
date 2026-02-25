-- Migración para añadir soporte de Rate Limiting (Token Bucket) al chat de Makito
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS chat_tokens integer DEFAULT 20,
  ADD COLUMN IF NOT EXISTS last_token_refill timestamp with time zone DEFAULT now();

-- Crear una función para rellenar tokens automáticamente a nivel de Base de Datos
-- (Esta función puede ser llamada vía RPC o manejada directamente en el backend Next.js)
CREATE OR REPLACE FUNCTION public.refill_chat_tokens(user_uuid uuid, max_tokens integer, refill_amount integer, interval_hours integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tokens integer;
  last_refill timestamp with time zone;
  hours_passed integer;
  tokens_to_add integer;
  new_tokens integer;
BEGIN
  -- Obtener el estado actual del perfil
  SELECT chat_tokens, last_token_refill 
  INTO current_tokens, last_refill 
  FROM public.profiles 
  WHERE id = user_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Calcular horas pasadas desde la última recarga
  hours_passed := EXTRACT(EPOCH FROM (now() - last_refill)) / 3600;

  IF hours_passed >= interval_hours THEN
    -- Calcular cuántas veces se puede aplicar el refill en el tiempo pasado
    tokens_to_add := FLOOR(hours_passed / interval_hours) * refill_amount;
    
    -- Sumar tokens y asegurar que no supere el máximo (ej. 20)
    new_tokens := LEAST(current_tokens + tokens_to_add, max_tokens);

    -- Actualizar perfil con los nuevos tokens y el nuevo tiempo (ajustado por las recargas completas)
    UPDATE public.profiles
    SET 
      chat_tokens = new_tokens,
      last_token_refill = last_refill + (FLOOR(hours_passed / interval_hours) * interval_hours * interval '1 hour')
    WHERE id = user_uuid;
    
    RETURN new_tokens;
  ELSE
    -- No han pasado suficientes horas, retornar tokens actuales
    RETURN current_tokens;
  END IF;
END;
$$;
