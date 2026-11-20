-- Partial unique indexes for circulation and reservation concurrency invariants
-- U-15C: Partial unique indexes for pending holds and active/overdue loans

-- 1. At most one pending reservation hold per physical book copy
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_copy_reservation
ON reservations (book_copy_id)
WHERE status = 'PENDING' AND book_copy_id IS NOT NULL;

-- 2. At most one pending reservation hold per student for a given title
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_student_title_reservation
ON reservations (student_id, book_id)
WHERE status = 'PENDING';

-- 3. At most one active or overdue loan per physical book copy
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_copy_loan
ON loans (book_copy_id)
WHERE status IN ('ACTIVE', 'OVERDUE');
