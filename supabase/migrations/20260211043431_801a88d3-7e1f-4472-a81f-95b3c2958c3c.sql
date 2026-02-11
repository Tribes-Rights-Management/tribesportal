CREATE OR REPLACE FUNCTION approve_queue_item(
  p_queue_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_queue_record RECORD;
  v_song_data JSONB;
  v_song_id UUID;
  v_song_number INTEGER;
  v_writer JSONB;
  v_writer_id UUID;
  v_song_writer_id UUID;
  v_publisher JSONB;
  v_tribes_entity_id UUID;
  v_writers JSONB;
  v_year TEXT;
  v_release_date DATE;
  v_alt_titles TEXT[];
  v_sanitized_title TEXT;
  v_chord_ext TEXT;
  v_display_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT is_platform_admin(v_user_id) THEN
    RAISE EXCEPTION 'Only platform admins can approve queue items';
  END IF;

  SELECT * INTO v_queue_record
  FROM song_queue
  WHERE id = p_queue_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Queue item not found';
  END IF;

  IF v_queue_record.status = 'approved' THEN
    RAISE EXCEPTION 'Queue item already approved';
  END IF;

  IF v_queue_record.status = 'rejected' THEN
    RAISE EXCEPTION 'Cannot approve a rejected item';
  END IF;

  v_song_data := v_queue_record.current_data;
  v_writers := v_song_data->'writers';

  IF v_song_data->>'title' IS NULL OR v_song_data->>'title' = '' THEN
    RAISE EXCEPTION 'Song title is required in current_data';
  END IF;

  IF v_writers IS NULL OR jsonb_array_length(v_writers) = 0 THEN
    RAISE EXCEPTION 'At least one writer is required in current_data';
  END IF;

  v_year := COALESCE(v_song_data->>'publication_year', v_song_data->>'creation_year');
  IF v_year IS NOT NULL AND v_year != '' THEN
    v_release_date := (v_year || '-01-01')::DATE;
  END IF;

  v_alt_titles := NULL;
  IF v_song_data->'alternate_titles' IS NOT NULL 
     AND jsonb_typeof(v_song_data->'alternate_titles') = 'array'
     AND jsonb_array_length(v_song_data->'alternate_titles') > 0 THEN
    v_alt_titles := ARRAY(SELECT jsonb_array_elements_text(v_song_data->'alternate_titles'));
  END IF;

  v_display_name := NULL;
  IF v_song_data->>'chord_chart_path' IS NOT NULL THEN
    v_sanitized_title := regexp_replace(v_song_data->>'title', '[^a-zA-Z0-9 -]', '', 'g');
    v_sanitized_title := regexp_replace(v_sanitized_title, '\s+', '-', 'g');
    v_chord_ext := split_part(v_song_data->>'chord_chart_path', '.', -1);
  END IF;

  -- STEP 1: Create the song
  INSERT INTO songs (
    title,
    alternate_titles,
    language,
    genre,
    release_date,
    metadata,
    is_active
  ) VALUES (
    v_song_data->>'title',
    v_alt_titles,
    COALESCE(v_song_data->>'language', 'English'),
    COALESCE(v_song_data->>'song_type', 'original'),
    v_release_date,
    jsonb_build_object(
      'song_type', v_song_data->>'song_type',
      'original_work_title', v_song_data->>'original_work_title',
      'release_status', v_song_data->>'release_status',
      'publication_year', v_song_data->>'publication_year',
      'creation_year', v_song_data->>'creation_year',
      'lyrics', v_song_data->>'lyrics',
      'lyrics_sections', v_song_data->'lyrics_sections',
      'lyrics_confirmed', (v_song_data->>'lyrics_confirmed')::BOOLEAN,
      'has_chord_chart', (v_song_data->>'has_chord_chart')::BOOLEAN,
      'copyright_status', v_song_data->>'copyright_status',
      'wants_copyright_filing', v_song_data->>'wants_copyright_filing',
      'chord_chart_path', v_song_data->>'chord_chart_path'
    ),
    true
  )
  RETURNING id, song_number INTO v_song_id, v_song_number;

  -- Update metadata with pretty display name now that we have song_number
  IF v_display_name IS NULL AND v_song_data->>'chord_chart_path' IS NOT NULL THEN
    v_display_name := v_song_number || '_' || v_sanitized_title || '_ChordChart.' || v_chord_ext;
    
    UPDATE songs SET metadata = metadata || jsonb_build_object(
      'chord_chart_display_name', v_display_name
    )
    WHERE id = v_song_id;
  END IF;

  -- STEP 2: Create song_writers
  FOR v_writer IN SELECT * FROM jsonb_array_elements(v_writers)
  LOOP
    v_writer_id := (v_writer->>'writer_id')::UUID;

    INSERT INTO song_writers (
      song_id,
      writer_id,
      share,
      credit,
      tribes_administered
    ) VALUES (
      v_song_id,
      v_writer_id,
      (v_writer->>'split')::NUMERIC(5,2),
      COALESCE(v_writer->>'credit', 'both'),
      COALESCE((v_writer->>'tribes_administered')::BOOLEAN, true)
    )
    RETURNING id INTO v_song_writer_id;

    -- STEP 3: Create song_ownership (if publishers in current_data)
    IF v_writer ? 'publishers' 
       AND jsonb_typeof(v_writer->'publishers') = 'array'
       AND jsonb_array_length(v_writer->'publishers') > 0 THEN

      FOR v_publisher IN SELECT * FROM jsonb_array_elements(v_writer->'publishers')
      LOOP
        v_tribes_entity_id := NULL;
        IF (v_publisher->>'tribes_administered')::BOOLEAN = true AND v_publisher->>'pro' IS NOT NULL THEN
          SELECT id INTO v_tribes_entity_id
          FROM tribes_entities
          WHERE pro = v_publisher->>'pro'
            AND is_active = true
          LIMIT 1;
        END IF;

        INSERT INTO song_ownership (
          song_id,
          song_writer_id,
          publisher_id,
          ownership_percentage,
          tribes_administered,
          administrator_entity_id
        ) VALUES (
          v_song_id,
          v_song_writer_id,
          (v_publisher->>'publisher_id')::UUID,
          COALESCE((v_publisher->>'share')::NUMERIC(5,2), (v_writer->>'split')::NUMERIC(5,2)),
          COALESCE((v_publisher->>'tribes_administered')::BOOLEAN, false),
          v_tribes_entity_id
        );
      END LOOP;
    END IF;
  END LOOP;

  -- STEP 4: Update queue record
  UPDATE song_queue
  SET
    status = 'approved',
    approved_song_id = v_song_id,
    reviewed_by = v_user_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_queue_id;

  RETURN v_song_id;
END;
$$;