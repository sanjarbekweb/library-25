-- Column names are quoted camelCase to match the Prisma schema (corrected 2026-11-20;
-- the earlier snake_case draft could not run). Definitions match the live database.
-- Partial unique indexes for circulation and reservation concurrency invariants
-- U-15C: Partial unique indexes for pending holds and active/overdue loans

-- 1. At most one pending reservation hold per physical book copy
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_copy_reservation
ON reservations ("bookCopyId")
WHERE status = 'PENDING' AND "bookCopyId" IS NOT NULL;

-- 2. At most one pending reservation hold per student for a given title
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_student_title_reservation
ON reservations ("studentId", "bookId")
WHERE status = 'PENDING';

-- 3. At most one active or overdue loan per physical book copy
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_copy_loan
ON loans ("bookCopyId")
WHERE status IN ('ACTIVE', 'OVERDUE');
