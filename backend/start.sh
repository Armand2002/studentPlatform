#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! pg_isready -h db -p 5432 -U tutoring; do
  sleep 1
done

echo "Database is ready!"

# Run migrations (handle common dev case with a squashed initial migration)
echo "Running migrations..."
# If a squashed initial migration exists, apply it and then stamp remaining heads
if [ -f migrations/versions/000_squashed_initial.py ]; then
  echo "Detected squashed initial migration"
  # Check if core table 'users' already exists in the database. If it does,
  # we likely have a pre-populated DB and should stamp remaining heads to
  # avoid duplicate CREATEs. If it doesn't, apply the squashed migration and
  # then run remaining migrations normally.
  users_exists=$(psql -h db -U tutoring -d tutoring -Atc "select to_regclass('public.users')" 2>/dev/null || true)
  if [ "$users_exists" = "users" ]; then
    echo "Core tables already exist in DB; stamping remaining heads to avoid duplicate object creation"
    alembic stamp heads
  else
    echo "DB appears empty; applying squashed initial migration then upgrading remaining heads"
    alembic upgrade 000_squashed_initial
  alembic upgrade heads

  # Post-migration dev fixes: add columns that may be missing from the squashed migration
  # These are idempotent and safe for local development only.
  echo "Applying post-migration compatibility fixes (dev-only)"
  export PGPASSWORD=password
  # Ensure user_sessions table exists (squashed migration omitted it). Create idempotently.
  psql -h db -U tutoring -d tutoring -c "CREATE TABLE IF NOT EXISTS user_sessions (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), refresh_token VARCHAR, expires_at TIMESTAMP, created_at TIMESTAMP);" || true
  psql -h db -U tutoring -d tutoring -c "CREATE INDEX IF NOT EXISTS ix_user_sessions_id ON user_sessions (id);" || true

  psql -h db -U tutoring -d tutoring -c "ALTER TABLE students ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;" || true
  psql -h db -U tutoring -d tutoring -c "ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;" || true
  psql -h db -U tutoring -d tutoring -c "ALTER TABLE tutors ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;" || true
  psql -h db -U tutoring -d tutoring -c "ALTER TABLE tutors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;" || true
  psql -h db -U tutoring -d tutoring -c "ALTER TABLE packages ADD COLUMN IF NOT EXISTS description TEXT;" || true
  psql -h db -U tutoring -d tutoring -c "ALTER TABLE packages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;" || true
  psql -h db -U tutoring -d tutoring -c "ALTER TABLE packages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;" || true
  psql -h db -U tutoring -d tutoring -c "ALTER TABLE admin_package_assignments ADD COLUMN IF NOT EXISTS custom_name VARCHAR(200);" || true
  fi
else
  # Fallback: apply all heads
  alembic upgrade heads
fi

# Start the application
echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
