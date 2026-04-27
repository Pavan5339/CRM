#!/bin/bash
# Upload storage backup files to new Supabase project via REST API
# Requires a service role key via SUPABASE_SERVICE_ROLE_KEY.

SUPABASE_URL="https://llfoaqnljjbneouiedbg.supabase.co"
SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
BACKUP_DIR="supabase/storage-backup"

if [ -z "$SERVICE_ROLE_KEY" ]; then
  echo "Error: set SUPABASE_SERVICE_ROLE_KEY before running this script." >&2
  exit 1
fi

upload_file() {
  local local_path="$1"
  local bucket="$2"
  # Get relative path within the bucket folder
  local relative_path="${local_path#${BACKUP_DIR}/${bucket}/}"
  local storage_path="${bucket}/${relative_path}"

  # Detect content type
  local content_type="application/octet-stream"
  case "$local_path" in
    *.png) content_type="image/png" ;;
    *.jpg|*.jpeg) content_type="image/jpeg" ;;
    *.webp) content_type="image/webp" ;;
    *.gif) content_type="image/gif" ;;
    *.pdf) content_type="application/pdf" ;;
    *.csv) content_type="text/csv" ;;
    *.svg) content_type="image/svg+xml" ;;
  esac

  echo "Uploading: ${storage_path}"
  curl -s -X POST \
    "${SUPABASE_URL}/storage/v1/object/${storage_path}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: ${content_type}" \
    -H "x-upsert: true" \
    --data-binary "@${local_path}" \
    -o /dev/null -w "  -> HTTP %{http_code}\n"
}

echo "=== Uploading employee-avatars ==="
find "${BACKUP_DIR}/employee-avatars" -type f | while read -r file; do
  upload_file "$file" "employee-avatars"
done

echo ""
echo "=== Uploading task-files ==="
find "${BACKUP_DIR}/task-files" -type f | while read -r file; do
  upload_file "$file" "task-files"
done

echo ""
echo "=== Done! ==="
