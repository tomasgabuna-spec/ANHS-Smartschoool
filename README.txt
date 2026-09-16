ANHS SMARTSCHOOL - Compliance & Lesson Plan Deadline Upgrade

Added features:
1. Lesson Plan Due Date & Time per cycle.
2. Default weekly deadline is Friday at 5:00 PM based on the selected lesson-plan date.
3. Status is automatically derived:
   - On Time = submitted at or before the due date
   - Late = submitted after the due date
   - Missing = no submission / no submission timestamp
4. Lesson Plan status pills use green/yellow/red colors.
5. Dashboard Weekly Compliance remains available with On Time/Late/Missing counts.
6. A sample Missing lesson plan is included so the new status is visible immediately.

To run:
- Extract the ZIP.
- Open the folder in VS Code.
- Open index.html with Live Server.

Demo accounts:
- Admin: admin / admin123
- Teacher: teacher1 / teacher123 (Ana Marie Villanueva, Grade 11 STEM A)
- Teacher: teacher2 / teacher123 (Jerome A. Bautista, Grade 10 Rizal)

SUBMISSION MONITORING TRACKER
- A "Submission Tracker" page lists one row per TEACHER (pulled from the Teachers roster), not one
  row per submitted file — a teacher who hasn't submitted still shows up automatically as Missing.
- Shows the current week by default, with Previous Week and Term filters plus teacher search.
- Derives each teacher's On Time, Late, or Missing status from the lesson-plan records and configured deadline.
- Includes summary counts for total teachers, On Time, Late, and Missing.
- Visible to Admin / Department Head accounts only.

WEEKLY COMPLIANCE SNAPSHOT WIDGET (Teachers page)
- A compact "who's on time" card sits at the top of Teacher Management: total teachers, On Time,
  Late, and Missing for the current week, with an "Open Submission Tracker" button that jumps to
  the full page for details/filters.
- Uses the exact same teacher-roster-driven logic as the full tracker, so a teacher who never
  submitted is never just left out — same guarantee, just visible without leaving the Teachers page.

Sample data note: all demo lesson-plan submissions/due dates are set to fall in the CURRENT week
(default deadline Friday 5:00 PM) so the tracker and widget show real On Time / Late / Missing
results out of the box instead of everything defaulting to Missing as the calendar moves forward.
Maria L. Santos is included as the "never submitted" example (Missing, no file) and is now also
in the Teachers roster so she's correctly picked up by the tracker.

ROLE-BASED VIEWS (Admin vs Teacher)
- Admin accounts see the full interface: Teachers, Submission Tracker, and Settings, plus every
  teacher's Lesson Plan / DLL submissions in the Lesson Plans table.
- Teacher accounts see a reduced interface: no Teachers, Submission Tracker, or Settings pages,
  and their Lesson Plans / DLL table is filtered to show only their own submissions. They cannot
  open or preview another teacher's uploaded file.
- When a teacher adds a lesson plan, the "Teacher Name" field is auto-filled and locked to their
  own account so they can only ever upload under their own name.

LESSON PLAN / DLL PREVIEW & REVIEW ROUTING
- Every lesson plan row has a Preview button (eye icon) that opens the uploaded file details;
  PDFs render inline, other file types show file info.
- Admin / Department Head accounts also get a "Checked by" control (in the table row and in the
  preview modal) to assign whether the Admin or the Department Head checks a given submission.
  This control is hidden from teacher accounts; teachers instead see a read-only badge showing
  who the file is currently assigned to.
- Note: this front-end demo has a single Admin login that represents school administration.
  "Department Head" is currently a review-routing label (who a file is assigned to for checking),
  not a separate login — add a dedicated Department Head account if that's needed later.
