ANHS SMARTSCHOOL - Compliance & Lesson Plan Deadline Upgrade

NOTE: Login runs on Firebase Authentication, and the Teachers roster,
Lesson Plan / DLL submissions, and Submission Tracker are all backed
by Firestore + Firebase Storage now (see FIREBASE_SETUP.txt for the
full setup, security rules, and the "keep teacher names in sync"
note). There are no demo accounts and no sample data anymore -
everything you see in the app is real data that your staff entered,
saved for real, and shared live across every signed-in device.

Added features:
1. Lesson Plan Due Date & Time per cycle.
2. Default weekly deadline is Friday at 5:00 PM based on the selected lesson-plan date.
3. Status is automatically derived:
   - On Time = submitted at or before the due date
   - Late = submitted after the due date
   - Missing = no submission / no submission timestamp
4. Lesson Plan status pills use green/yellow/red colors.
5. Dashboard Weekly Compliance is derived live from the same real Teachers/Lesson Plans
   data as the Submission Tracker (On Time/Late/Missing counts, plus a per-department
   compliance rate).

To run:
- Extract the ZIP.
- Open the folder in VS Code.
- Follow FIREBASE_SETUP.txt to connect your Firebase project (required - the app
  won't work until firebase-config.js has your real project values).
- Open index.html with Live Server, and log in with a staff account created per
  FIREBASE_SETUP.txt.

GETTING REAL DATA IN
- Log in as an Admin account and use Teachers > Add Teacher to build the roster.
  Removing a teacher (trash icon, Admin only) only removes their roster entry - it
  does not delete their login or any lesson plans they already submitted.
- Use Lesson Plans > Add Lesson Plan to submit a real file for any teacher (Admin)
  or your own account (Teacher). The uploaded file is saved to Firebase Storage, so
  Preview and the "Checked by" review routing work from any device.
- The very first submission for a teacher is what makes them show up as On Time/Late
  in the tracker instead of Missing - until then, every teacher in the roster
  correctly shows as Missing for the current week, by design.

SUBMISSION MONITORING TRACKER
- A "Submission Tracker" page lists one row per TEACHER (pulled from the Teachers roster), not one
  row per submitted file — a teacher who hasn't submitted still shows up automatically as Missing.
- Shows the current week by default, with Previous Week and Term filters plus teacher search.
- Derives each teacher's On Time, Late, or Missing status from the lesson-plan records and configured deadline.
- Includes summary counts for total teachers, On Time, Late, and Missing.
- Visible to Admin / Department Head accounts only.
- Reads live from Firestore, so a submission made on one device shows up here immediately
  on every other signed-in device, with no refresh needed.

WEEKLY COMPLIANCE SNAPSHOT WIDGET (Teachers page)
- A compact "who's on time" card sits at the top of Teacher Management: total teachers, On Time,
  Late, and Missing for the current week, with an "Open Submission Tracker" button that jumps to
  the full page for details/filters.
- Uses the exact same teacher-roster-driven logic as the full tracker, so a teacher who never
  submitted is never just left out — same guarantee, just visible without leaving the Teachers page.

ROLE-BASED VIEWS (Admin vs Teacher)
- Admin accounts see the full interface: Teachers, Submission Tracker, and Settings, plus every
  teacher's Lesson Plan / DLL submissions in the Lesson Plans table.
- Teacher accounts see a reduced interface: no Teachers, Submission Tracker, or Settings pages,
  and their Lesson Plans / DLL table is filtered to show only their own submissions. They cannot
  open or preview another teacher's uploaded file.
- When a teacher adds a lesson plan, the "Teacher Name" field is auto-filled and locked to their
  own account so they can only ever upload under their own name.
- Only Admin accounts can add or remove entries in the Teachers roster.

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
