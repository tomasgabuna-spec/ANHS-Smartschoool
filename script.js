/* ==================================
   ANHS SMARTSCHOOL JAVASCRIPT
================================== */


/* ================================
   LOGIN / AUTHENTICATION
================================ */

/* Accounts now live in Firebase:
   - Firebase Authentication holds the email + password.
   - A matching Firestore document in the "users" collection
     (doc ID = the account's Auth UID) holds the profile info
     below: role, name, title, initials, grade, section.
   See FIREBASE_SETUP.txt for exactly how to create one.
   Teacher accounts see a reduced menu (see ADMIN_ONLY_PAGES)
   and can only see and upload their own lesson plans (see
   applyLessonPlanVisibility). The "name" field is what ties a
   teacher account to their rows in the Lesson Plan table /
   Teacher Name dropdown - keep it identical in both places. */

let currentUser = null;


/* ================================
   TEACHERS / LESSON PLANS - FIRESTORE
   LIVE DATA (replaces the old in-page
   demo rows so the roster and every
   submission are saved for real and
   shared across every device/account).
================================ */

let teachersCache = [];
let lessonPlansCache = [];
let teachersUnsubscribe = null;
let lessonPlansUnsubscribe = null;


function escapeHtml(value) {

    return String(value === null || value === undefined ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* Starts (or restarts) the two live Firestore listeners.
   Called once a user is signed in. Every other teacher/admin
   signed in at the same time gets the same updates in real
   time, which is what makes submissions "shared" instead of
   living only in one browser's memory. */

function startDataListeners() {

    if (teachersUnsubscribe) teachersUnsubscribe();
    if (lessonPlansUnsubscribe) lessonPlansUnsubscribe();

    teachersUnsubscribe = db.collection("teachers")
        .orderBy("name")
        .onSnapshot(function(snapshot) {

            teachersCache = snapshot.docs.map(function(doc) {
                return Object.assign({ id: doc.id }, doc.data());
            });

            renderTeacherTable();
            populateLessonTeacherOptions();
            renderTeacherComplianceWidget();
            renderSubmissionTracker();
            updateDashboardCounts();
            updateComplianceDashboard();

        }, function(err) {

            console.error("Could not load the teacher roster:", err);

        });

    lessonPlansUnsubscribe = db.collection("lessonPlans")
        .orderBy("submittedAt", "desc")
        .onSnapshot(function(snapshot) {

            lessonPlansCache = snapshot.docs.map(function(doc) {
                return Object.assign({ id: doc.id }, doc.data());
            });

            renderLessonPlanTable();
            renderTeacherComplianceWidget();
            renderSubmissionTracker();
            updateDashboardCounts();
            updateComplianceDashboard();

        }, function(err) {

            console.error("Could not load lesson plan submissions:", err);

        });

}


/* Detaches the listeners and clears the local cache on logout,
   so a signed-out browser doesn't keep watching the collections
   (Firestore rules would reject it anyway) and the next login
   starts from a clean slate. */

function stopDataListeners() {

    if (teachersUnsubscribe) teachersUnsubscribe();
    if (lessonPlansUnsubscribe) lessonPlansUnsubscribe();

    teachersUnsubscribe = null;
    lessonPlansUnsubscribe = null;

    teachersCache = [];
    lessonPlansCache = [];

}


/* Loads the profile document (role/name/title/initials/...)
   that matches a signed-in Firebase Auth user, and shapes it
   into the same "account" object the rest of the app expects. */

async function loadUserProfile(firebaseUser) {

    const doc =
        await db.collection("users").doc(firebaseUser.uid).get();

    if (!doc.exists) return null;

    const profile = doc.data();

    return {
        uid: firebaseUser.uid,
        username: firebaseUser.email,
        email: firebaseUser.email,
        role: profile.role,
        name: profile.name,
        title: profile.title,
        initials: profile.initials,
        grade: profile.grade,
        section: profile.section,
        photoURL: profile.photoURL || null
    };

}


/* If the browser still has a signed-in Firebase session
   (e.g. the page was refreshed), skip straight back into the
   app instead of showing the login form again. */

let resumedSession = false;

auth.onAuthStateChanged(async function(firebaseUser) {

    if (!firebaseUser || currentUser || resumedSession) return;

    resumedSession = true;

    const account = await loadUserProfile(firebaseUser);

    if (!account) return;

    currentUser = account;

    applyUserRole(account);

    startDataListeners();

    showApp();

    showPage("dashboard");

});


const loginPage =
    document.getElementById("loginPage");

const appRoot =
    document.getElementById("app");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const togglePassword =
    document.getElementById("togglePassword");

const loginPasswordInput =
    document.getElementById("loginPassword");

const ADMIN_ONLY_PAGES =
    ["navTeachers", "navSubmissionTracker", "navSettings"];

const RESTRICTED_TEACHER_PAGES =
    ["teachers", "submissiontracker", "settings"];

const TRACKER_NAV_ID = "navSubmissionTracker";


function showApp() {

    loginPage.classList.add("hidden");
    appRoot.classList.remove("hidden");

}


function showLoginPage() {

    appRoot.classList.add("hidden");
    loginPage.classList.remove("hidden");

    loginError.classList.remove("show");

    currentUser = null;

    stopDataListeners();

    if (auth.currentUser) {

        auth.signOut();

    }

    if (loginForm) {

        loginForm.reset();

    }

}


function applyUserRole(account) {

    /* Sidebar + topbar identity */

    const initials = account.initials;

    document.getElementById("sidebarAvatar").textContent = initials;
    document.getElementById("sidebarUserName").textContent = account.name;
    document.getElementById("sidebarUserRole").textContent = account.title;

    document.getElementById("topbarAvatar").textContent = initials;
    document.getElementById("topbarUserName").textContent = account.name;
    document.getElementById("topbarUserRole").textContent = account.title;

    /* If this account has a profile picture saved in Firebase,
       show it instead of the initials. */

    applyAccountAvatar(account);

    pageNames.dashboard.subtitle =
        "Welcome back, " + account.name + "!";


    /* Admin-only navigation (Teachers, Submission Tracker,
       Settings) is hidden from teacher accounts, since a
       teacher should only upload and track their own lesson
       plans, not run or monitor the whole school. */

    const isTeacher = account.role === "teacher";

    ADMIN_ONLY_PAGES.forEach(function(id) {

        const navEl =
            document.getElementById(id);

        if (navEl) {

            navEl.classList.toggle("hidden", isTeacher);

        }

    });


    /* Lesson Plans / DLL page reads differently for the
       two roles: admins/department heads oversee everyone's
       submissions, teachers only manage their own. */

    if (pageNames.lessonplans) {

        pageNames.lessonplans.subtitle =
            isTeacher
                ? "Upload and track your own lesson plans / DLL."
                : "Prepare and track teachers' daily lesson logs (DLL) and lesson plans.";

    }


    /* Dashboard: hide school-wide faculty roster stat and
       "Add Teacher" quick action for teacher accounts. */

    const teacherStatCard =
        document.getElementById("teacherCount")?.closest(".stat-card");

    if (teacherStatCard) {

        teacherStatCard.classList.toggle("hidden", isTeacher);

    }

    const addTeacherQuickAction =
        document.querySelector('.quick-action[data-page="teachers"]');

    if (addTeacherQuickAction) {

        addTeacherQuickAction.classList.toggle("hidden", isTeacher);

    }


    applyLessonPlanVisibility();
    updateDashboardCounts();

}


/* ================================
   PROFILE PICTURE & SCHOOL LOGO
   UPLOAD (stored in Firebase Storage
   and linked from Firestore, so the
   same picture shows on every device)
================================ */

const avatarUploadInput =
    document.getElementById("avatarUploadInput");

const logoUploadInput =
    document.getElementById("logoUploadInput");


function readImageFile(file, callback) {

    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {

        alert("Please choose an image file.");
        return;

    }

    callback(file);

}


function setAvatarDisplay(el, imageUrl, initials) {

    if (!el) return;

    if (imageUrl) {

        el.style.backgroundImage = "url(\"" + imageUrl + "\")";
        el.classList.add("has-image");
        el.textContent = "";

    } else {

        el.style.backgroundImage = "";
        el.classList.remove("has-image");
        el.textContent = initials || "";

    }

}


function applyAccountAvatar(account) {

    setAvatarDisplay(document.getElementById("sidebarAvatar"), account.photoURL, account.initials);
    setAvatarDisplay(document.getElementById("topbarAvatar"), account.photoURL, account.initials);

}


function setLogoDisplay(imageUrl) {

    const logos = [
        document.getElementById("loginBrandLogo"),
        document.getElementById("sidebarBrandLogo")
    ];

    logos.forEach(function(el) {

        if (!el) return;

        if (imageUrl) {

            el.style.backgroundImage = "url(\"" + imageUrl + "\")";
            el.classList.add("has-image");

        } else {

            el.style.backgroundImage = "";
            el.classList.remove("has-image");

        }

    });

}


/* The school logo is shared by everyone, so it's loaded from
   Firestore as soon as the page opens, even before anyone logs
   in (the login page shows it too). */

async function applyStoredLogo() {

    try {

        const doc =
            await db.collection("settings").doc("school").get();

        if (doc.exists && doc.data().logoURL) {

            setLogoDisplay(doc.data().logoURL);

        }

    } catch (err) {

        console.error("Could not load school logo:", err);

    }

}


/* Clicking either avatar opens the file picker for a new
   profile picture, saved for the currently signed-in account. */

["sidebarAvatar", "topbarAvatar"].forEach(function(id) {

    const el = document.getElementById(id);

    if (el && avatarUploadInput) {

        el.addEventListener("click", function() {

            if (!currentUser) return;

            avatarUploadInput.click();

        });

    }

});


if (avatarUploadInput) {

    avatarUploadInput.addEventListener("change", function(event) {

        const file = event.target.files[0];

        readImageFile(file, async function(imageFile) {

            if (!currentUser) return;

            try {

                const fileRef =
                    storage.ref().child("avatars/" + currentUser.uid);

                await fileRef.put(imageFile);

                const url = await fileRef.getDownloadURL();

                await db.collection("users").doc(currentUser.uid).update({
                    photoURL: url
                });

                currentUser.photoURL = url;

                applyAccountAvatar(currentUser);

            } catch (err) {

                console.error("Could not upload profile picture:", err);

                alert("Sorry, that picture couldn't be uploaded. Please try again.");

            }

        });

        avatarUploadInput.value = "";

    });

}


/* Clicking the ANHS SmartSchool icon (login page or sidebar)
   opens the file picker for a new school logo, shared by
   every account. */

["loginBrandLogo", "sidebarBrandLogo"].forEach(function(id) {

    const el = document.getElementById(id);

    if (el && logoUploadInput) {

        el.classList.add("editable-logo");

        el.addEventListener("click", function() {

            logoUploadInput.click();

        });

    }

});


if (logoUploadInput) {

    logoUploadInput.addEventListener("change", function(event) {

        const file = event.target.files[0];

        readImageFile(file, async function(imageFile) {

            try {

                const fileRef =
                    storage.ref().child("school/logo");

                await fileRef.put(imageFile);

                const url = await fileRef.getDownloadURL();

                await db.collection("settings").doc("school").set(
                    { logoURL: url },
                    { merge: true }
                );

                setLogoDisplay(url);

            } catch (err) {

                console.error("Could not upload school logo:", err);

                alert("Sorry, that logo couldn't be uploaded. Please try again.");

            }

        });

        logoUploadInput.value = "";

    });

}


applyStoredLogo();


if (togglePassword) {

    togglePassword.addEventListener("click", function() {

        const isPassword =
            loginPasswordInput.type === "password";

        loginPasswordInput.type =
            isPassword
                ? "text"
                : "password";

        this.innerHTML =
            isPassword
                ? '<i class="fa-regular fa-eye-slash"></i>'
                : '<i class="fa-regular fa-eye"></i>';

    });

}


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginUsername"
                ).value.trim();

            const password =
                loginPasswordInput.value;


            loginError.classList.remove("show");


            try {

                const credential =
                    await auth.signInWithEmailAndPassword(email, password);

                const account =
                    await loadUserProfile(credential.user);

                if (!account) {

                    loginError.textContent =
                        "No profile found for this account. Ask your admin to finish setting it up in Firestore.";

                    loginError.classList.add("show");

                    await auth.signOut();

                    return;

                }

                currentUser = account;

                applyUserRole(account);

                startDataListeners();

                showApp();

                showPage("dashboard");

            } catch (err) {

                loginError.textContent =
                    "Invalid email or password.";

                loginError.classList.add("show");

            }

        }
    );

}


/* ================================
   PAGE NAVIGATION
================================ */

const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const pageNames = {

    dashboard: {
        title: "Dashboard",
        subtitle: "Welcome back, Administrator!"
    },

    teachers: {
        title: "Teachers",
        subtitle: "Manage faculty information and assignments."
    },

    submissiontracker: {
        title: "Submission Tracker",
        subtitle: "Monitor every teacher's lesson-plan compliance for the selected week."
    },

    lessonplans: {
        title: "Lesson Plans / DLL",
        subtitle: "Prepare and track daily lesson logs."
    },

    settings: {
        title: "Settings",
        subtitle: "Configure ANHS SmartSchool."
    }

};


function showPage(pageName) {

    pages.forEach(page => {

        page.classList.remove("active-page");

    });


    const selectedPage =
        document.getElementById(pageName);

    if (selectedPage) {

        selectedPage.classList.add("active-page");

    }


    navItems.forEach(item => {

        item.classList.remove("active");

        if (item.dataset.page === pageName) {

            item.classList.add("active");

        }

    });


    if (pageNames[pageName]) {

        pageTitle.textContent =
            pageNames[pageName].title;

        pageSubtitle.textContent =
            pageNames[pageName].subtitle;

    }


    /* Close sidebar on mobile */

    document
        .getElementById("sidebar")
        .classList.remove("open");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* Navigation links */

navItems.forEach(item => {

    item.addEventListener("click", function(event) {

        event.preventDefault();

        showPage(this.dataset.page);

    });

});


/* Quick action buttons */

document.querySelectorAll("[data-page]")
    .forEach(button => {

        if (!button.classList.contains("nav-item")) {

            button.addEventListener("click", function() {

                showPage(this.dataset.page);

            });

        }

    });


/* ================================
   MOBILE SIDEBAR
================================ */

const menuToggle =
    document.getElementById("menuToggle");

const sidebar =
    document.getElementById("sidebar");

menuToggle.addEventListener("click", function() {

    sidebar.classList.toggle("open");

});


/* ================================
   LESSON PLAN SEARCH
================================ */

const lessonPlanSearch =
    document.getElementById("lessonPlanSearch");

if (lessonPlanSearch) {

    lessonPlanSearch.addEventListener("input", function() {

        const searchValue =
            this.value.toLowerCase();

        const rows =
            document.querySelectorAll(
                "#lessonPlanTable tbody tr"
            );

        rows.forEach(row => {

            const text =
                row.textContent.toLowerCase();

            row.style.display =
                text.includes(searchValue)
                    ? ""
                    : "none";

        });

    });

}


/* ================================
   LESSON PLAN MODAL
================================ */

const lessonPlanModal =
    document.getElementById("lessonPlanModal");

const addLessonPlanBtn =
    document.getElementById("addLessonPlanBtn");

const closeLessonPlanModal =
    document.getElementById("closeLessonPlanModal");

const cancelLessonPlanModal =
    document.getElementById("cancelLessonPlanModal");


function openLessonPlanModal() {

    lessonPlanModal.classList.add("show");

    if (newLessonDateInput && !newLessonDateInput.value) {
        const today = new Date();
        const pad = value => String(value).padStart(2, "0");
        newLessonDateInput.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    }

    setDefaultLessonDueDate();

    /* Teachers can only ever upload under their own name —
       lock the Teacher Name field to whoever is logged in
       so they can't submit as (or see files under) someone
       else. Admins keep full control of the field. */

    const teacherSelect =
        document.getElementById("newLessonTeacher");

    if (teacherSelect) {

        if (currentUser && currentUser.role === "teacher") {

            teacherSelect.value = currentUser.name;
            teacherSelect.disabled = true;
            teacherSelect.dispatchEvent(new Event("change"));

        } else {

            teacherSelect.disabled = false;

        }

    }

}


function hideLessonPlanModal() {

    lessonPlanModal.classList.remove("show");

    lessonPlanForm.reset();

    resetGradeSectionSelect();

    clearLessonFile();

}


if (addLessonPlanBtn) {

    addLessonPlanBtn.addEventListener(
        "click",
        openLessonPlanModal
    );

}


if (closeLessonPlanModal) {

    closeLessonPlanModal.addEventListener(
        "click",
        hideLessonPlanModal
    );

}


if (cancelLessonPlanModal) {

    cancelLessonPlanModal.addEventListener(
        "click",
        hideLessonPlanModal
    );

}


/* Close modal by clicking background */

if (lessonPlanModal) {

    lessonPlanModal.addEventListener("click", function(event) {

        if (event.target === lessonPlanModal) {

            hideLessonPlanModal();

        }

    });

}


/* ================================
   TEACHER -> DEPARTMENT AUTO-FILL
================================ */

const newLessonTeacher =
    document.getElementById("newLessonTeacher");

const newLessonDepartment =
    document.getElementById("newLessonDepartment");

if (newLessonTeacher && newLessonDepartment) {

    newLessonTeacher.addEventListener("change", function() {

        const selectedOption =
            this.options[this.selectedIndex];

        const department =
            selectedOption
                ? selectedOption.dataset.department || ""
                : "";

        newLessonDepartment.value = department;

    });

}


/* ================================
   LESSON PLAN WEEK OPTIONS + CONFIGURABLE DEADLINE
================================ */

const newLessonWeek = document.getElementById("newLessonWeek");
const newLessonDueDate = document.getElementById("newLessonDueDate");
const newLessonDateInput = document.getElementById("newLessonDate");
const dueDateHelp = document.getElementById("dueDateHelp");

const DEFAULT_DEADLINE_SETTINGS = {
    day: 5,       // Friday (1=Monday ... 5=Friday)
    time: "17:00"
};

function getDeadlineSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem("anhsLessonDeadlineSettings") || "null");
        if (saved && Number(saved.day) >= 1 && Number(saved.day) <= 5 && /^\d{2}:\d{2}$/.test(saved.time || "")) {
            return { day: Number(saved.day), time: saved.time };
        }
    } catch (error) {
        console.warn("Could not read saved deadline settings.", error);
    }
    return { ...DEFAULT_DEADLINE_SETTINGS };
}

function saveDeadlineSettings(settings) {
    localStorage.setItem("anhsLessonDeadlineSettings", JSON.stringify(settings));
}

function formatDeadlineSettings(settings) {
    const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const [hours, minutes] = settings.time.split(":").map(Number);
    const sample = new Date(2000, 0, 1, hours, minutes);
    return `${dayNames[settings.day]}, ${sample.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function getConfiguredDeadline(dateValue) {
    if (!dateValue) return "";
    const settings = getDeadlineSettings();
    const date = new Date(dateValue + "T00:00:00");
    const currentDay = date.getDay() === 0 ? 7 : date.getDay();
    const daysToDeadline = (settings.day - currentDay + 7) % 7;
    date.setDate(date.getDate() + daysToDeadline);
    const [hours, minutes] = settings.time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);

    const pad = value => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hours)}:${pad(minutes)}`;
}

function updateDeadlineHelp() {
    const label = formatDeadlineSettings(getDeadlineSettings());
    if (dueDateHelp) dueDateHelp.textContent = `Default weekly deadline: ${label}. You may adjust it for this cycle.`;
    const preview = document.getElementById("deadlinePreview");
    if (preview) preview.textContent = `Default weekly deadline: ${label}`;
}

function setDefaultLessonDueDate() {
    if (!newLessonDueDate || !newLessonDateInput) return;
    const deadline = getConfiguredDeadline(newLessonDateInput.value);
    if (deadline) newLessonDueDate.value = deadline;
    updateDeadlineHelp();
}

if (newLessonDateInput) newLessonDateInput.addEventListener("change", setDefaultLessonDueDate);

if (newLessonWeek) {
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.textContent = "Select week";
    newLessonWeek.appendChild(placeholderOption);
    for (let week = 1; week <= 20; week++) {
        const option = document.createElement("option");
        option.value = `Week ${week}`;
        option.textContent = `Week ${week}`;
        newLessonWeek.appendChild(option);
    }
}

/* ================================
   SETTINGS - WEEKLY DEADLINE
================================ */

function initializeDeadlineSettings() {
    const settings = getDeadlineSettings();
    const dayInput = document.getElementById("deadlineDaySetting");
    const timeInput = document.getElementById("deadlineTimeSetting");
    if (dayInput) dayInput.value = String(settings.day);
    if (timeInput) timeInput.value = settings.time;
    updateDeadlineHelp();
}

const saveSettingsBtn = document.getElementById("saveSettingsBtn");
if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", function() {
        const day = Number(document.getElementById("deadlineDaySetting").value);
        const time = document.getElementById("deadlineTimeSetting").value;
        if (day < 1 || day > 5 || !/^\d{2}:\d{2}$/.test(time)) {
            alert("Please select a valid Monday-Friday deadline and time.");
            return;
        }
        saveDeadlineSettings({ day, time });
        updateDeadlineHelp();
        setDefaultLessonDueDate();
        normalizeLessonPlanStatuses();
        alert(`Settings saved. New lesson plans will use ${formatDeadlineSettings({ day, time })} as the default weekly deadline.`);
    });
}

initializeDeadlineSettings();

/* ================================
   GRADE & SECTION MULTI-SELECT
================================ */

const gradeSectionSelect =
    document.getElementById("gradeSectionSelect");

const gradeSectionToggle =
    document.getElementById("gradeSectionToggle");

const gradeSectionToggleText =
    document.getElementById("gradeSectionToggleText");

const gradeSectionPanel =
    document.getElementById("gradeSectionPanel");

const gradeSectionField =
    gradeSectionSelect
        ? gradeSectionSelect.closest(".dropdown-field")
        : null;


function getCheckedGradeSections() {

    if (!gradeSectionPanel) return [];

    return Array.from(
        gradeSectionPanel.querySelectorAll(
            "input[type='checkbox']:checked"
        )
    ).map(checkbox => checkbox.value);

}


function updateGradeSectionToggleText() {

    const selected =
        getCheckedGradeSections();

    if (selected.length === 0) {

        gradeSectionToggleText.textContent =
            "Select grade & section";

    } else if (selected.length === 1) {

        gradeSectionToggleText.textContent =
            selected[0];

    } else {

        gradeSectionToggleText.textContent =
            `${selected.length} sections selected`;

    }

}


if (gradeSectionToggle) {

    gradeSectionToggle.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            gradeSectionSelect.classList.toggle("open");

        }
    );

}


if (gradeSectionPanel) {

    gradeSectionPanel.addEventListener(
        "change",
        function(event) {

            if (event.target.matches("input[type='checkbox']")) {

                updateGradeSectionToggleText();

                if (gradeSectionField) {

                    gradeSectionField.classList.remove(
                        "field-invalid"
                    );

                }

            }

        }
    );

    gradeSectionPanel.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

        }
    );

}


document.addEventListener("click", function(event) {

    if (
        gradeSectionSelect &&
        gradeSectionSelect.classList.contains("open") &&
        !gradeSectionSelect.contains(event.target)
    ) {

        gradeSectionSelect.classList.remove("open");

    }

});


function resetGradeSectionSelect() {

    if (!gradeSectionPanel) return;

    gradeSectionPanel
        .querySelectorAll("input[type='checkbox']")
        .forEach(checkbox => {
            checkbox.checked = false;
        });

    updateGradeSectionToggleText();

    if (gradeSectionSelect) {
        gradeSectionSelect.classList.remove("open");
    }

    if (gradeSectionField) {
        gradeSectionField.classList.remove("field-invalid");
    }

}


/* ================================
   LESSON PLAN FILE UPLOAD
================================ */

const lessonFileUpload =
    document.getElementById("lessonFileUpload");

const lessonFileInput =
    document.getElementById("newLessonFile");

const lessonFileDropzone =
    document.getElementById("lessonFileDropzone");

const lessonFileName =
    document.getElementById("lessonFileName");

const lessonFileSize =
    document.getElementById("lessonFileSize");

const lessonFileRemove =
    document.getElementById("lessonFileRemove");


function formatFileSize(bytes) {

    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}


function setLessonFile(file) {

    if (!file) return;

    lessonFileName.textContent = file.name;
    lessonFileSize.textContent = formatFileSize(file.size);

    lessonFileUpload.classList.add("has-file");

    lessonFileUpload.classList.remove(
        "field-invalid"
    );

}


function clearLessonFile() {

    lessonFileInput.value = "";

    lessonFileUpload.classList.remove("has-file");

}


if (lessonFileDropzone) {

    lessonFileDropzone.addEventListener(
        "click",
        function() {
            lessonFileInput.click();
        }
    );

    lessonFileDropzone.addEventListener(
        "dragover",
        function(event) {
            event.preventDefault();
            lessonFileDropzone.classList.add("dragover");
        }
    );

    lessonFileDropzone.addEventListener(
        "dragleave",
        function() {
            lessonFileDropzone.classList.remove("dragover");
        }
    );

    lessonFileDropzone.addEventListener(
        "drop",
        function(event) {

            event.preventDefault();

            lessonFileDropzone.classList.remove("dragover");

            const file =
                event.dataTransfer.files &&
                event.dataTransfer.files[0];

            if (file) {

                lessonFileInput.files =
                    event.dataTransfer.files;

                setLessonFile(file);

            }

        }
    );

}


if (lessonFileInput) {

    lessonFileInput.addEventListener(
        "change",
        function() {

            const file = this.files[0];

            if (file) {
                setLessonFile(file);
            }

        }
    );

}


if (lessonFileRemove) {

    lessonFileRemove.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            clearLessonFile();

        }
    );

}


/* ================================
   LESSON PLAN COMPLIANCE STATUS
================================ */

function getLessonPlanStatus(submittedAt, dueAt, hasFile = true) {

    if (!hasFile) return "Missing";
    if (!submittedAt || !dueAt) return "Missing";

    return new Date(submittedAt).getTime() <= new Date(dueAt).getTime()
        ? "On Time"
        : "Late";

}


function getStatusClass(status) {

    if (status === "On Time") return "status-on-time";
    if (status === "Late") return "status-late";
    return "status-missing";

}


/* ================================
   ROLE-BASED LESSON PLAN ACCESS

   Teachers may only upload and see their OWN lesson
   plan / DLL submissions — never another teacher's
   uploaded file. Only admin / department-head accounts
   can browse every submission and choose who checks it
   (see the "Checked by" reviewer control).
================================ */

function applyLessonPlanVisibility() {

    const rows =
        document.querySelectorAll("#lessonPlanTable tbody tr");

    const isTeacher =
        !!currentUser && currentUser.role === "teacher";

    rows.forEach(function(row) {

        const teacherName =
            row.querySelectorAll("td")[1]?.textContent.trim() || "";

        const isOwnRow =
            !currentUser || teacherName === currentUser.name;

        /* A teacher only ever sees rows that belong to them. */
        row.classList.toggle("hidden", isTeacher && !isOwnRow);

        /* Only admin / department-head can choose the
           checker for a file, so hide that control for
           teachers and show a read-only status instead. */
        const reviewerSelect = row.querySelector(".reviewer-select");
        const assignBtn = row.querySelector(".assign-review-btn");

        if (reviewerSelect) reviewerSelect.classList.toggle("hidden", isTeacher);
        if (assignBtn) assignBtn.classList.toggle("hidden", isTeacher);

        const actionsCell = row.querySelector(".lesson-actions");
        let badge = row.querySelector(".review-status-badge");

        if (isTeacher && actionsCell) {

            const reviewer = row.dataset.reviewer || "admin";

            if (!badge) {
                badge = document.createElement("span");
                badge.className = "review-status-badge";
                actionsCell.appendChild(badge);
            }

            badge.innerHTML =
                `<i class="fa-solid fa-user-shield"></i> ${reviewerLabel(reviewer)}`;

        } else if (badge) {

            badge.remove();

        }

    });

}


function formatDueDate(dateTimeValue) {

    if (!dateTimeValue) return "—";

    return new Date(dateTimeValue).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });

}


function normalizeLessonPlanStatuses() {

    /* Status/due-date cells are now computed live off the
       Firestore-backed cache every time the table renders, so
       refreshing after a deadline-settings change is just a
       re-render rather than patching cells in place. */
    renderLessonPlanTable();

}


/* ================================
   ADD LESSON PLAN
================================ */

const lessonPlanForm =
    document.getElementById("lessonPlanForm");


if (lessonPlanForm) {

    lessonPlanForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const rawDate =
                document.getElementById(
                    "newLessonDate"
                ).value;

            const rawDueDate =
                document.getElementById(
                    "newLessonDueDate"
                ).value;

            const term =
                document.getElementById(
                    "newLessonTerm"
                ).value;

            const week =
                document.getElementById(
                    "newLessonWeek"
                ).value;

            const teacher =
                document.getElementById(
                    "newLessonTeacher"
                ).value;

            const department =
                document.getElementById(
                    "newLessonDepartment"
                ).value;

            const subject =
                document.getElementById(
                    "newLessonSubject"
                ).value;

            const sections =
                getCheckedGradeSections();

            const file =
                lessonFileInput.files[0];


            /* Validate grade & section */

            let hasError = false;

            if (!rawDueDate) {
                document.getElementById("newLessonDueDate").classList.add("field-invalid");
                hasError = true;
            } else {
                document.getElementById("newLessonDueDate").classList.remove("field-invalid");
            }

            if (sections.length === 0) {

                gradeSectionField.classList.add(
                    "field-invalid"
                );

                hasError = true;

            }


            /* Validate uploaded file — required */

            if (!file) {

                lessonFileUpload.classList.add(
                    "field-invalid"
                );

                hasError = true;

            }


            if (hasError) {
                return;
            }


            const formattedDate =
                rawDate
                    ? new Date(rawDate + "T00:00:00")
                        .toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        })
                    : "";


            const sectionText =
                sections.length === 1
                    ? sections[0]
                    : `${sections[0]} +${sections.length - 1} more`;


            const fileExtension =
                file.name.split(".").pop().toLowerCase();

            const fileIcon =
                fileExtension === "pdf"
                    ? "fa-file-pdf"
                    : ["doc", "docx"].includes(fileExtension)
                        ? "fa-file-word"
                        : ["ppt", "pptx"].includes(fileExtension)
                            ? "fa-file-powerpoint"
                            : "fa-file-lines";


            const submittedAt = new Date().toISOString();
            const dueAt = rawDueDate;


            /* Upload the actual file to Firebase Storage (same
               pattern already used for avatars/the school logo)
               so it's saved for real and can be opened from any
               device, then save the submission record — with a
               link to that file — in Firestore so every signed-in
               account sees it immediately. */

            const submitBtn =
                lessonPlanForm.querySelector('button[type="submit"]');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.textContent = "Uploading...";
            }

            try {

                const storagePath =
                    "lessonPlans/" + Date.now() + "_" + file.name;

                const fileRef =
                    storage.ref().child(storagePath);

                await fileRef.put(file);

                const fileURL =
                    await fileRef.getDownloadURL();

                await db.collection("lessonPlans").add({
                    teacher: teacher,
                    department: department,
                    subject: subject,
                    sections: sections,
                    sectionText: sectionText,
                    term: term,
                    week: week,
                    submittedAt: submittedAt,
                    dueAt: dueAt,
                    fileName: file.name,
                    fileIcon: fileIcon,
                    fileURL: fileURL,
                    storagePath: storagePath,
                    reviewer: "admin",
                    createdBy: currentUser ? currentUser.uid : null,
                    createdAt: submittedAt
                });

                hideLessonPlanModal();

                alert(
                    "Lesson plan successfully saved to ANHS SmartSchool."
                );

            } catch (err) {

                console.error("Could not save the lesson plan:", err);

                alert(
                    "Sorry, that lesson plan couldn't be uploaded. Please check your connection and try again."
                );

            } finally {

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText || "Save Lesson Plan";
                }

            }

        }
    );

}


/* ================================
   TEACHER SEARCH + DEPARTMENT FILTER
================================ */

const teacherSearch =
    document.getElementById("teacherSearch");

const teacherDepartmentFilter =
    document.getElementById("teacherDepartmentFilter");


function filterTeacherTable() {

    const searchValue =
        teacherSearch
            ? teacherSearch.value.toLowerCase()
            : "";

    const departmentValue =
        teacherDepartmentFilter
            ? teacherDepartmentFilter.value
            : "all";

    const rows =
        document.querySelectorAll(
            "#teacherTable tbody tr"
        );

    rows.forEach(row => {

        const text =
            row.textContent.toLowerCase();

        const matchesSearch =
            text.includes(searchValue);

        const matchesDepartment =
            departmentValue === "all" ||
            row.dataset.department === departmentValue;

        row.style.display =
            matchesSearch && matchesDepartment
                ? ""
                : "none";

    });

}


if (teacherSearch) {

    teacherSearch.addEventListener(
        "input",
        filterTeacherTable
    );

}


if (teacherDepartmentFilter) {

    teacherDepartmentFilter.addEventListener(
        "change",
        filterTeacherTable
    );

}


/* ================================
   TEACHER MODAL
================================ */

const teacherModal =
    document.getElementById("teacherModal");

const addTeacherBtn =
    document.getElementById("addTeacherBtn");

const closeTeacherModal =
    document.getElementById("closeTeacherModal");

const cancelTeacherModal =
    document.getElementById("cancelTeacherModal");


function openTeacherModal() {

    teacherModal.classList.add("show");

}


function hideTeacherModal() {

    teacherModal.classList.remove("show");

}


if (addTeacherBtn) {

    addTeacherBtn.addEventListener(
        "click",
        openTeacherModal
    );

}


if (closeTeacherModal) {

    closeTeacherModal.addEventListener(
        "click",
        hideTeacherModal
    );

}


if (cancelTeacherModal) {

    cancelTeacherModal.addEventListener(
        "click",
        hideTeacherModal
    );

}


if (teacherModal) {

    teacherModal.addEventListener("click", function(event) {

        if (event.target === teacherModal) {

            hideTeacherModal();

        }

    });

}


/* ================================
   ADD TEACHER
================================ */

const teacherForm =
    document.getElementById("teacherForm");


if (teacherForm) {

    teacherForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "newTeacherName"
                ).value.trim();

            const sex =
                document.getElementById(
                    "newTeacherSex"
                ).value;

            const age =
                document.getElementById(
                    "newTeacherAge"
                ).value;

            const department =
                document.getElementById(
                    "newTeacherDepartment"
                ).value;

            const position =
                document.getElementById(
                    "newTeacherPosition"
                ).value.trim();

            const years =
                document.getElementById(
                    "newTeacherYears"
                ).value;

            const postGrad =
                document.getElementById(
                    "newTeacherPostGrad"
                ).value;

            if (!name) return;


            /* Saved straight to Firestore's "teachers" collection
               instead of just being appended to the table in
               memory, so the roster is shared with every signed-in
               account and survives a refresh. */

            const submitBtn =
                teacherForm.querySelector('button[type="submit"]');

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.textContent = "Saving...";
            }

            try {

                await db.collection("teachers").add({
                    name: name,
                    sex: sex,
                    age: age,
                    department: department,
                    position: position,
                    years: years,
                    postGrad: postGrad,
                    createdBy: currentUser ? currentUser.uid : null,
                    createdAt: new Date().toISOString()
                });

                teacherForm.reset();
                hideTeacherModal();

                alert(
                    "Teacher successfully added to ANHS SmartSchool."
                );

            } catch (err) {

                console.error("Could not add teacher:", err);

                alert(
                    "Sorry, that teacher couldn't be saved. Please try again."
                );

            } finally {

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = submitBtn.dataset.originalText || "Save Teacher";
                }

            }

        }
    );

}


/* ================================
   DELETE TEACHER (roster only — does
   not touch their login account or
   any lesson plans they've already
   submitted)
================================ */

async function deleteTeacherRecord(teacherId, teacherName) {

    if (!currentUser || currentUser.role !== "admin") return;

    const confirmed = confirm(
        `Remove ${teacherName || "this teacher"} from the roster? ` +
        "This does not delete their login account or past lesson plan submissions."
    );

    if (!confirmed) return;

    try {

        await db.collection("teachers").doc(teacherId).delete();

    } catch (err) {

        console.error("Could not remove teacher:", err);

        alert("Sorry, that teacher couldn't be removed. Please try again.");

    }

}


/* ================================
   LESSON PLAN PREVIEW + REVIEW ROUTING
================================ */

const lessonPreviewModal = document.getElementById("lessonPreviewModal");
const closeLessonPreviewModal = document.getElementById("closeLessonPreviewModal");
const closePreviewBtn = document.getElementById("closePreviewBtn");
const saveReviewerBtn = document.getElementById("saveReviewerBtn");
const previewReviewerSelect = document.getElementById("previewReviewerSelect");
let activeLessonRow = null;

function reviewerLabel(value) {
    return value === "department-head" ? "Department Head" : "Admin / School Administrator";
}

function openLessonPreview(row) {
    if (!lessonPreviewModal || !row) return;

    const isTeacher = !!currentUser && currentUser.role === "teacher";
    const cells = row.querySelectorAll("td");
    const teacherName = cells[1]?.textContent.trim() || "";

    /* Safety net: a teacher can never open another
       teacher's uploaded file, even if this were somehow
       triggered outside the normal table view. */
    if (isTeacher && teacherName !== currentUser.name) return;

    activeLessonRow = row;

    const reviewRouting = document.querySelector(".review-routing");
    if (reviewRouting) reviewRouting.classList.toggle("hidden", isTeacher);

    document.getElementById("previewTeacher").textContent = cells[1]?.textContent.trim() || "—";
    document.getElementById("previewSubject").textContent = cells[3]?.textContent.trim() || "—";
    document.getElementById("previewSection").textContent = cells[4]?.textContent.trim() || "—";
    document.getElementById("previewTermWeek").textContent = `${cells[5]?.textContent.trim() || "—"} / ${cells[6]?.textContent.trim() || "—"}`;
    document.getElementById("previewStatus").innerHTML = cells[9]?.innerHTML || "—";
    const select = row.querySelector(".reviewer-select");
    const reviewer = row.dataset.reviewer || select?.value || "admin";
    previewReviewerSelect.value = reviewer;
    document.getElementById("previewReviewer").textContent = reviewerLabel(reviewer);
    const fileChip = row.querySelector(".file-chip");
    const fileName = row.dataset.fileName || fileChip?.textContent.trim() || "No file submitted";
    document.getElementById("previewFileName").textContent = fileName;
    const frame = document.getElementById("lessonFileFrame");
    const message = document.getElementById("previewFileMessage");
    frame.hidden = true;
    frame.removeAttribute("src");
    if (row.dataset.fileUrl && /\.pdf$/i.test(fileName)) {
        frame.src = row.dataset.fileUrl;
        frame.hidden = false;
        message.textContent = "PDF preview is available below.";
    } else if (fileChip && !/No file submitted/i.test(fileName)) {
        message.textContent = "File is uploaded. Use the assigned checker action to review the document.";
    } else {
        message.textContent = "No uploaded file is available for preview.";
    }
    lessonPreviewModal.classList.add("show");
}

function closeLessonPreview() {
    lessonPreviewModal?.classList.remove("show");
    const frame = document.getElementById("lessonFileFrame");
    if (frame) frame.removeAttribute("src");
    activeLessonRow = null;
}

/* Persists a reviewer assignment to the lesson plan's Firestore
   doc. The live listener (startDataListeners) then re-renders the
   table for every signed-in account, so the assignment is shared
   immediately instead of only living in one browser's row. */

async function updateLessonPlanReviewer(planId, reviewer) {

    try {

        await db.collection("lessonPlans").doc(planId).update({
            reviewer: reviewer
        });

        alert(`File assigned to ${reviewerLabel(reviewer)} for checking.`);

    } catch (err) {

        console.error("Could not update the reviewer assignment:", err);

        alert("Sorry, that assignment couldn't be saved. Please try again.");

    }

}

document.addEventListener("click", function(event) {
    const previewButton = event.target.closest(".preview-lesson-btn");
    const assignButton = event.target.closest(".assign-review-btn");
    const deleteTeacherButton = event.target.closest(".delete-teacher-btn");

    if (previewButton) {
        openLessonPreview(previewButton.closest("tr"));
        return;
    }

    if (assignButton) {
        if (currentUser && currentUser.role === "teacher") return;
        const row = assignButton.closest("tr");
        const select = row?.querySelector(".reviewer-select");
        if (row && select && row.dataset.id) {
            updateLessonPlanReviewer(row.dataset.id, select.value);
        }
        return;
    }

    if (deleteTeacherButton) {
        const row = deleteTeacherButton.closest("tr");
        if (row && row.dataset.id) {
            const name = row.querySelector("td")?.textContent.trim();
            deleteTeacherRecord(row.dataset.id, name);
        }
    }
});

document.addEventListener("change", function(event) {
    if (!event.target.matches(".reviewer-select")) return;
    if (currentUser && currentUser.role === "teacher") return;
    const row = event.target.closest("tr");
    if (row && row.dataset.id) {
        updateLessonPlanReviewer(row.dataset.id, event.target.value);
    }
});

closeLessonPreviewModal?.addEventListener("click", closeLessonPreview);
closePreviewBtn?.addEventListener("click", closeLessonPreview);
lessonPreviewModal?.addEventListener("click", function(event) {
    if (event.target === lessonPreviewModal) closeLessonPreview();
});
saveReviewerBtn?.addEventListener("click", async function() {
    if (!activeLessonRow || !activeLessonRow.dataset.id) return;
    if (currentUser && currentUser.role === "teacher") return;
    const reviewer = previewReviewerSelect.value;
    await updateLessonPlanReviewer(activeLessonRow.dataset.id, reviewer);
    document.getElementById("previewReviewer").textContent = reviewerLabel(reviewer);
});


/* ================================
   LOGOUT
================================ */

const logoutBtn =
    document.querySelector(
        ".logout-btn"
    );


logoutBtn.addEventListener(
    "click",
    function() {

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );


        if (confirmLogout) {

            showLoginPage();

        }

    }
);




/* ================================
   SUBMISSION MONITORING TRACKER
================================ */

function getWeekStart(offsetWeeks = 0) {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    monday.setDate(monday.getDate() + diffToMonday + (offsetWeeks * 7));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function getWeekEnd(offsetWeeks = 0) {
    const monday = getWeekStart(offsetWeeks);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
}

function getWeekRangeLabel(offsetWeeks = 0) {
    const start = getWeekStart(offsetWeeks);
    const end = getWeekEnd(offsetWeeks);
    const options = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
}

function getTrackerWeekOffset() {
    const value = document.getElementById("trackerWeekFilter")?.value || "current";
    return value === "previous" ? -1 : 0;
}

/* Teacher roster and lesson-plan records now come straight from
   the live Firestore caches (see startDataListeners) instead of
   being scraped back out of the HTML table — the table is just a
   rendered view of this data now. */

function getTeacherRecords() {
    return teachersCache.map(teacher => ({
        name: teacher.name || "Unknown Teacher",
        department: teacher.department || "Academic"
    }));
}

function getLessonPlanRecords() {
    return lessonPlansCache.map(plan => ({
        submittedAt: plan.submittedAt || "",
        dueAt: plan.dueAt || "",
        teacher: plan.teacher || "",
        term: plan.term || "",
        week: plan.week || "",
        hasFile: !!plan.fileURL
    }));
}


/* ================================
   RENDER: TEACHERS TABLE
================================ */

function renderTeacherTable() {

    const tbody = document.querySelector("#teacherTable tbody");
    if (!tbody) return;

    const isAdmin = !!currentUser && currentUser.role === "admin";

    if (!teachersCache.length) {

        tbody.innerHTML = `<tr><td colspan="8" class="tracker-no-results">
            <i class="fa-solid fa-user-slash"></i>
            No teachers in the roster yet. Use "Add Teacher" to add one.
        </td></tr>`;

    } else {

        tbody.innerHTML = teachersCache.map(function(teacher) {

            const department = teacher.department || "Academic";
            const departmentClass = department === "TechPro" ? "techpro" : "academic";

            return `<tr data-department="${escapeHtml(department)}" data-id="${teacher.id}">
                <td>${escapeHtml(teacher.name)}</td>
                <td>${escapeHtml(teacher.sex || "—")}</td>
                <td>${escapeHtml(teacher.age || "—")}</td>
                <td><span class="status ${departmentClass}">${escapeHtml(department)}</span></td>
                <td>${escapeHtml(teacher.position || "—")}</td>
                <td>${escapeHtml(teacher.years || "—")}</td>
                <td>${escapeHtml(teacher.postGrad || "—")}</td>
                <td class="lesson-action-cell">
                    <div class="lesson-actions">
                        <button type="button" class="table-btn delete-teacher-btn" title="Remove teacher" ${isAdmin ? "" : "disabled"}>
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;

        }).join("");

    }

    filterTeacherTable();

}


/* ================================
   RENDER: LESSON PLAN / DLL TABLE
================================ */

function renderLessonPlanTable() {

    const tbody = document.querySelector("#lessonPlanTable tbody");
    if (!tbody) return;

    if (!lessonPlansCache.length) {

        tbody.innerHTML = `<tr><td colspan="11" class="tracker-no-results">
            <i class="fa-solid fa-file-circle-xmark"></i>
            No lesson plans submitted yet.
        </td></tr>`;

    } else {

        tbody.innerHTML = lessonPlansCache.map(function(plan) {

            const status = getLessonPlanStatus(plan.submittedAt, plan.dueAt, !!plan.fileURL);
            const department = plan.department || "Academic";
            const departmentClass = department === "TechPro" ? "techpro" : "academic";
            const reviewer = plan.reviewer || "admin";

            const fileCellHtml = plan.fileURL
                ? `<span class="file-chip"><i class="fa-solid ${plan.fileIcon || "fa-file-lines"}"></i> ${escapeHtml(plan.fileName || "File")}</span>`
                : `<span class="file-chip"><i class="fa-solid fa-file-circle-xmark"></i> No file submitted</span>`;

            return `<tr
                data-id="${plan.id}"
                data-submitted-at="${plan.submittedAt || ""}"
                data-due-at="${plan.dueAt || ""}"
                data-reviewer="${reviewer}"
                data-file-name="${escapeHtml(plan.fileName || "")}"
                data-file-url="${plan.fileURL || ""}"
            >
                <td>${plan.submittedAt ? formatDueDate(plan.submittedAt) : "—"}</td>
                <td>${escapeHtml(plan.teacher || "")}</td>
                <td><span class="status ${departmentClass}">${escapeHtml(department)}</span></td>
                <td>${escapeHtml(plan.subject || "")}</td>
                <td>${escapeHtml(plan.sectionText || "")}</td>
                <td>${escapeHtml(plan.term || "")}</td>
                <td>${escapeHtml(plan.week || "")}</td>
                <td class="lesson-due-cell">${plan.dueAt ? formatDueDate(plan.dueAt) : "—"}</td>
                <td>${fileCellHtml}</td>
                <td class="lesson-status-cell"><span class="status ${getStatusClass(status)}">${status}</span></td>
                <td class="lesson-action-cell">
                    <div class="lesson-actions">
                        <button type="button" class="table-btn preview-lesson-btn" title="Preview lesson plan">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <select class="reviewer-select" title="Choose who will check this file">
                            <option value="admin">Admin Check</option>
                            <option value="department-head">Department Head Check</option>
                        </select>
                        <button type="button" class="table-btn assign-review-btn" title="Assign reviewer">
                            <i class="fa-solid fa-user-check"></i>
                        </button>
                    </div>
                </td>
            </tr>`;

        }).join("");

        tbody.querySelectorAll("tr[data-id]").forEach(function(row) {
            const select = row.querySelector(".reviewer-select");
            if (select) select.value = row.dataset.reviewer || "admin";
        });

    }

    applyLessonPlanVisibility();

    if (lessonPlanSearch && lessonPlanSearch.value) {
        lessonPlanSearch.dispatchEvent(new Event("input"));
    }

}


/* Keeps the "Teacher Name" dropdown on the Add Lesson Plan form
   in sync with the live roster, instead of a hardcoded list of
   demo names. */

function populateLessonTeacherOptions() {

    if (!newLessonTeacher) return;

    const previousValue = newLessonTeacher.value;

    newLessonTeacher.innerHTML =
        '<option value="" disabled selected>Select teacher</option>' +
        teachersCache.map(function(teacher) {
            return `<option data-department="${escapeHtml(teacher.department || "")}">${escapeHtml(teacher.name)}</option>`;
        }).join("");

    if (teachersCache.some(t => t.name === previousValue)) {
        newLessonTeacher.value = previousValue;
    }

}

function statusPriority(status) {
    return { "Missing": 3, "Late": 2, "On Time": 1 }[status] || 0;
}

function getTeacherWeekCompliance(teacherName, offsetWeeks, termFilter) {
    const start = getWeekStart(offsetWeeks);
    const end = getWeekEnd(offsetWeeks);
    const records = getLessonPlanRecords().filter(record => {
        if (record.teacher !== teacherName || !record.dueAt) return false;
        if (termFilter !== "all" && record.term !== termFilter) return false;
        const due = new Date(record.dueAt);
        return due >= start && due <= end;
    });

    if (!records.length) {
        return {
            status: "Missing",
            dueAt: getConfiguredDeadline(toInputDate(start)),
            submittedAt: "",
            week: "Current Cycle"
        };
    }

    let selected = records[0];
    let selectedStatus = getLessonPlanStatus(selected.submittedAt, selected.dueAt, selected.hasFile);
    records.slice(1).forEach(record => {
        const status = getLessonPlanStatus(record.submittedAt, record.dueAt, record.hasFile);
        if (statusPriority(status) > statusPriority(selectedStatus) ||
            (statusPriority(status) === statusPriority(selectedStatus) && new Date(record.dueAt) > new Date(selected.dueAt))) {
            selected = record;
            selectedStatus = status;
        }
    });

    return {
        status: selectedStatus,
        dueAt: selected.dueAt,
        submittedAt: selected.submittedAt,
        week: selected.week || "Current Cycle"
    };
}

function toInputDate(date) {
    const pad = n => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function renderSubmissionTracker() {
    const body = document.getElementById("submissionTrackerBody");
    if (!body) return;

    const offsetWeeks = getTrackerWeekOffset();
    const termFilter = document.getElementById("trackerTermFilter")?.value || "all";
    const search = (document.getElementById("trackerSearch")?.value || "").toLowerCase().trim();
    const teachers = getTeacherRecords().filter(teacher => teacher.name.toLowerCase().includes(search));

    const label = document.getElementById("trackerWeekLabel");
    if (label) label.textContent = `${offsetWeeks === 0 ? "Current week" : "Previous week"} • ${getWeekRangeLabel(offsetWeeks)}`;

    let counts = { "On Time": 0, "Late": 0, "Missing": 0 };

    if (!teachers.length) {
        body.innerHTML = `<tr><td colspan="7" class="tracker-no-results">
            <i class="fa-solid fa-user-slash"></i>
            No teachers match the current search.
        </td></tr>`;
    } else {
        body.innerHTML = teachers.map(teacher => {
        const compliance = getTeacherWeekCompliance(teacher.name, offsetWeeks, termFilter);
        counts[compliance.status]++;
        const departmentClass = teacher.department === "TechPro" ? "techpro" : "academic";
        const submitted = compliance.submittedAt ? formatDueDate(compliance.submittedAt) : "—";
        const due = compliance.dueAt ? formatDueDate(compliance.dueAt) : "—";
        const termWeek = compliance.week && compliance.week !== "Current Cycle"
            ? `${termFilter === "all" ? "" : termFilter + " • "}${compliance.week}`
            : (termFilter === "all" ? "Current Cycle" : `${termFilter} • Current Cycle`);
        const rate = compliance.status === "On Time" ? "100%" : compliance.status === "Late" ? "0%" : "0%";

        return `<tr>
            <td><strong>${teacher.name}</strong></td>
            <td><span class="status ${departmentClass}">${teacher.department}</span></td>
            <td>${termWeek}</td>
            <td>${due}</td>
            <td>${submitted}</td>
            <td><span class="status ${getStatusClass(compliance.status)}">${compliance.status}</span></td>
            <td><div class="tracker-compliance-cell"><div class="tracker-mini-bar"><span style="width:${rate}"></span></div><strong>${rate}</strong></div></td>
        </tr>`;
        }).join("");
    }

    document.getElementById("trackerTotalTeachers").textContent = teachers.length;
    document.getElementById("trackerOnTime").textContent = counts["On Time"];
    document.getElementById("trackerLate").textContent = counts["Late"];
    document.getElementById("trackerMissing").textContent = counts["Missing"];
}

/* ================================
   WEEKLY COMPLIANCE SNAPSHOT WIDGET
   (Teachers page) — same one-row-per-teacher logic as
   the full Submission Tracker, always for the current
   week / all terms, with a shortcut into the full page.
================================ */

function renderTeacherComplianceWidget() {
    const totalEl = document.getElementById("teacherWidgetTotal");
    if (!totalEl) return;

    const teachers = getTeacherRecords();
    let counts = { "On Time": 0, "Late": 0, "Missing": 0 };

    teachers.forEach(teacher => {
        const compliance = getTeacherWeekCompliance(teacher.name, 0, "all");
        counts[compliance.status]++;
    });

    totalEl.textContent = teachers.length;
    document.getElementById("teacherWidgetOnTime").textContent = counts["On Time"];
    document.getElementById("teacherWidgetLate").textContent = counts["Late"];
    document.getElementById("teacherWidgetMissing").textContent = counts["Missing"];

    const weekLabel = document.getElementById("teacherWidgetWeekLabel");
    if (weekLabel) weekLabel.textContent = `Current week • ${getWeekRangeLabel(0)}`;
}

["trackerWeekFilter", "trackerTermFilter"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener("change", renderSubmissionTracker);
});

const trackerSearch = document.getElementById("trackerSearch");
if (trackerSearch) trackerSearch.addEventListener("input", renderSubmissionTracker);

const originalShowPage = showPage;
showPage = function(pageName) {

    /* Defense in depth: even if a teacher account somehow
       triggers navigation to an admin-only page (its nav
       link is already hidden), fall back to the dashboard
       instead of rendering it. */
    if (currentUser && currentUser.role === "teacher" && RESTRICTED_TEACHER_PAGES.includes(pageName)) {
        pageName = "dashboard";
    }

    originalShowPage(pageName);
    if (pageName === "submissiontracker") renderSubmissionTracker();
    if (pageName === "lessonplans") applyLessonPlanVisibility();
    if (pageName === "teachers") renderTeacherComplianceWidget();
};

/* ================================
   WEEKLY COMPLIANCE DASHBOARD
   (now computed live from the same
   Firestore-backed teacher/lesson-plan
   caches that power the Submission
   Tracker, instead of hardcoded numbers)
================================ */

function getCurrentWeekLabel() {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const options = { month: "short", day: "numeric" };
    return `${monday.toLocaleDateString(undefined, options)} - ${sunday.toLocaleDateString(undefined, options)}`;
}

function computeWeekComplianceCounts(teacherList) {
    let counts = { "On Time": 0, "Late": 0, "Missing": 0 };
    teacherList.forEach(function(teacher) {
        const compliance = getTeacherWeekCompliance(teacher.name, 0, "all");
        counts[compliance.status]++;
    });
    return counts;
}

function updateComplianceDashboard() {

    const allTeachers = getTeacherRecords();
    const counts = computeWeekComplianceCounts(allTeachers);
    const total = counts["On Time"] + counts["Late"] + counts["Missing"];
    const rate = total ? Math.round((counts["On Time"] / total) * 100) : 0;

    const onTime = document.getElementById("onTimeCount");
    const late = document.getElementById("lateCount");
    const missing = document.getElementById("missingCount");
    const overall = document.getElementById("overallComplianceRate");
    const weekLabel = document.getElementById("complianceWeekLabel");
    const list = document.getElementById("departmentComplianceList");

    if (onTime) onTime.textContent = counts["On Time"];
    if (late) late.textContent = counts["Late"];
    if (missing) missing.textContent = counts["Missing"];
    if (overall) overall.textContent = `${rate}%`;
    if (weekLabel) weekLabel.textContent = `Current week • ${getCurrentWeekLabel()}`;

    if (list) {

        const departmentNames = ["Academic", "TechPro"];

        const departmentRates = departmentNames.map(function(deptName) {

            const deptTeachers = allTeachers.filter(t => t.department === deptName);
            const deptCounts = computeWeekComplianceCounts(deptTeachers);
            const deptTotal = deptTeachers.length;
            const deptRate = deptTotal ? Math.round((deptCounts["On Time"] / deptTotal) * 100) : 0;

            return { name: deptName, rate: deptRate };

        });

        departmentRates.push({ name: "All Departments", rate: rate });

        list.innerHTML = departmentRates.map(dept => `
            <div class="department-row">
                <span>${dept.name}</span>
                <div class="compliance-bar" aria-label="${dept.name} compliance ${dept.rate}%">
                    <span style="width:${dept.rate}%"></span>
                </div>
                <strong>${dept.rate}%</strong>
            </div>
        `).join("");

    }

}

/* ================================
   INITIALIZE
================================ */

normalizeLessonPlanStatuses();

function updateDashboardCounts() {

    const isTeacher =
        !!currentUser && currentUser.role === "teacher";

    const relevantPlans =
        isTeacher
            ? lessonPlansCache.filter(plan => plan.teacher === currentUser.name)
            : lessonPlansCache;

    const lessonCount =
        document.getElementById("lessonPlanCount");

    if (lessonCount) {

        lessonCount.textContent = relevantPlans.length;

    }


    const teacherCount =
        document.getElementById("teacherCount");

    if (teacherCount) {

        teacherCount.textContent = teachersCache.length;

    }

}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        showPage("dashboard");

        updateDashboardCounts();
        renderSubmissionTracker();
        renderTeacherComplianceWidget();

    }
);