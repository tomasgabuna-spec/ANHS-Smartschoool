/* ==================================
   ANHS SMARTSCHOOL JAVASCRIPT
================================== */


/* ================================
   LOGIN / AUTHENTICATION
================================ */

/* Demo accounts. In a real system these would be
   verified against the school's database. Adviser
   accounts see a reduced menu (see ADMIN_ONLY_PAGES). */

const DEMO_ACCOUNTS = [
    {
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "Administrator",
        title: "School Admin",
        initials: "AD"
    },
    {
        username: "adviser1",
        password: "adviser123",
        role: "adviser",
        name: "Mr. J. Santos",
        title: "Adviser - Grade 11 STEM A",
        initials: "JS",
        grade: "Grade 11",
        section: "STEM A"
    },
    {
        username: "adviser2",
        password: "adviser123",
        role: "adviser",
        name: "Ms. L. Cruz",
        title: "Adviser - Grade 10 Rizal",
        initials: "LC",
        grade: "Grade 10",
        section: "Rizal"
    }
];

let currentUser = null;

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
    ["navTeachers", "navSettings"];

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

    pageNames.dashboard.subtitle =
        "Welcome back, " + account.name + "!";


    /* Admin-only navigation is hidden from advisers, since
       an adviser should only encode/manage their own
       advisory class, not run the whole school. */

    const isAdviser = account.role === "adviser";

    ADMIN_ONLY_PAGES.forEach(function(id) {

        const navEl =
            document.getElementById(id);

        if (navEl) {

            navEl.classList.toggle("hidden", isAdviser);

        }

    });


}


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
        function(event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "loginUsername"
                ).value.trim();

            const password =
                loginPasswordInput.value;


            const account =
                DEMO_ACCOUNTS.find(function(acc) {

                    return (
                        acc.username === username &&
                        acc.password === password
                    );

                });


            if (account) {

                loginError.classList.remove("show");

                currentUser = account;

                applyUserRole(account);

                showApp();

                showPage("dashboard");

            } else {

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

    document.querySelectorAll("#lessonPlanTable tbody tr").forEach(row => {

        const submittedAt = row.dataset.submittedAt || "";
        const dueAt = row.dataset.dueAt || "";
        const fileCell = row.querySelector(".file-chip");
        const hasFile = !!fileCell;
        const status = getLessonPlanStatus(submittedAt, dueAt, hasFile);
        const statusCell = row.querySelector(".lesson-status-cell") || row.querySelector("td:nth-last-child(2)");

        if (statusCell) {
            statusCell.innerHTML = `<span class="status ${getStatusClass(status)}">${status}</span>`;
        }

        const dueCell = row.querySelector(".lesson-due-cell");
        if (dueCell && dueAt) {
            dueCell.textContent = formatDueDate(dueAt);
        }

    });

}


/* ================================
   ADD LESSON PLAN
================================ */

const lessonPlanForm =
    document.getElementById("lessonPlanForm");


if (lessonPlanForm) {

    lessonPlanForm.addEventListener(
        "submit",
        function(event) {

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
            const status = getLessonPlanStatus(submittedAt, dueAt, !!file);


            const tbody =
                document.querySelector(
                    "#lessonPlanTable tbody"
                );


            const row =
                document.createElement("tr");


            const departmentClass =
                department === "TechPro"
                    ? "techpro"
                    : "academic";


            row.dataset.submittedAt = submittedAt;
            row.dataset.dueAt = dueAt;

            row.innerHTML = `

                <td>${new Date(submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</td>

                <td>${teacher}</td>

                <td>
                    <span class="status ${departmentClass}">
                        ${department}
                    </span>
                </td>

                <td>${subject}</td>

                <td>${sectionText}</td>

                <td>${term}</td>

                <td>${week}</td>

                <td class="lesson-due-cell">${formatDueDate(dueAt)}</td>

                <td>
                    <span class="file-chip">
                        <i class="fa-solid ${fileIcon}"></i>
                        ${file.name}
                    </span>
                </td>

                <td class="lesson-status-cell">
                    <span class="status ${getStatusClass(status)}">
                        ${status}
                    </span>
                </td>

                <td>

                    <button class="table-btn">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            `;


            tbody.appendChild(row);


            updateDashboardCounts();
        updateComplianceDashboard();


            hideLessonPlanModal();


            alert(
                "Lesson plan successfully saved to ANHS SmartSchool."
            );

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
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "newTeacherName"
                ).value;

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
                ).value;

            const years =
                document.getElementById(
                    "newTeacherYears"
                ).value;

            const postGrad =
                document.getElementById(
                    "newTeacherPostGrad"
                ).value;


            const departmentClass =
                department === "TechPro"
                    ? "techpro"
                    : "academic";


            const tbody =
                document.querySelector(
                    "#teacherTable tbody"
                );


            const row =
                document.createElement("tr");

            row.dataset.department = department;


            row.innerHTML = `

                <td>${name}</td>

                <td>${sex}</td>

                <td>${age}</td>

                <td>
                    <span class="status ${departmentClass}">
                        ${department}
                    </span>
                </td>

                <td>${position}</td>

                <td>${years}</td>

                <td>${postGrad}</td>

                <td>

                    <button class="table-btn">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            `;


            tbody.appendChild(row);


            /* Update teacher count on dashboard */

            const teacherCountElement =
                document.getElementById(
                    "teacherCount"
                );

            if (teacherCountElement) {

                let currentTeacherCount =
                    parseInt(
                        teacherCountElement.textContent.replace(
                            ",",
                            ""
                        )
                    );

                currentTeacherCount++;

                teacherCountElement.textContent =
                    currentTeacherCount.toLocaleString();

            }


            teacherForm.reset();

            hideTeacherModal();


            alert(
                "Teacher successfully added to ANHS SmartSchool."
            );

        }
    );

}


/* ================================
   NOTIFICATION
================================ */

const notificationBtn =
    document.querySelector(
        ".notification-btn"
    );


notificationBtn.addEventListener(
    "click",
    function() {

        alert(
            "You have 3 new notifications."
        );

    }
);


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

function getTeacherRecords() {
    return Array.from(document.querySelectorAll("#teacherTable tbody tr")).map(row => {
        const cells = row.querySelectorAll("td");
        return {
            name: cells[0]?.textContent.trim() || "Unknown Teacher",
            department: row.dataset.department || cells[3]?.textContent.trim() || "Academic"
        };
    });
}

function getLessonPlanRecords() {
    return Array.from(document.querySelectorAll("#lessonPlanTable tbody tr")).map(row => {
        const cells = row.querySelectorAll("td");
        return {
            submittedAt: row.dataset.submittedAt || "",
            dueAt: row.dataset.dueAt || "",
            teacher: cells[1]?.textContent.trim() || "",
            term: cells[5]?.textContent.trim() || "",
            week: cells[6]?.textContent.trim() || "",
            hasFile: !!row.querySelector(".file-chip")
        };
    });
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

    document.getElementById("trackerTotalTeachers").textContent = teachers.length;
    document.getElementById("trackerOnTime").textContent = counts["On Time"];
    document.getElementById("trackerLate").textContent = counts["Late"];
    document.getElementById("trackerMissing").textContent = counts["Missing"];
}

["trackerWeekFilter", "trackerTermFilter"].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.addEventListener("change", renderSubmissionTracker);
});

const trackerSearch = document.getElementById("trackerSearch");
if (trackerSearch) trackerSearch.addEventListener("input", renderSubmissionTracker);

const originalShowPage = showPage;
showPage = function(pageName) {
    originalShowPage(pageName);
    if (pageName === "submissiontracker") renderSubmissionTracker();
};

/* ================================
   WEEKLY COMPLIANCE DASHBOARD
================================ */

const WEEKLY_COMPLIANCE = {
    onTime: 62,
    late: 14,
    missing: 10
};

const DEPARTMENT_COMPLIANCE = [
    { name: "Academic", rate: 76 },
    { name: "TechPro", rate: 68 },
    { name: "All Departments", rate: 72 }
];

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

function updateComplianceDashboard() {
    const total = WEEKLY_COMPLIANCE.onTime + WEEKLY_COMPLIANCE.late + WEEKLY_COMPLIANCE.missing;
    const rate = total ? Math.round((WEEKLY_COMPLIANCE.onTime / total) * 100) : 0;

    const onTime = document.getElementById("onTimeCount");
    const late = document.getElementById("lateCount");
    const missing = document.getElementById("missingCount");
    const overall = document.getElementById("overallComplianceRate");
    const weekLabel = document.getElementById("complianceWeekLabel");
    const list = document.getElementById("departmentComplianceList");

    if (onTime) onTime.textContent = WEEKLY_COMPLIANCE.onTime;
    if (late) late.textContent = WEEKLY_COMPLIANCE.late;
    if (missing) missing.textContent = WEEKLY_COMPLIANCE.missing;
    if (overall) overall.textContent = `${rate}%`;
    if (weekLabel) weekLabel.textContent = `Current week • ${getCurrentWeekLabel()}`;

    if (list) {
        list.innerHTML = DEPARTMENT_COMPLIANCE.map(dept => `
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

    const lessonRows =
        document.querySelectorAll("#lessonPlanTable tbody tr");

    const lessonCount =
        document.getElementById("lessonPlanCount");

    if (lessonCount) {

        lessonCount.textContent = lessonRows.length;

    }


    const teacherRows =
        document.querySelectorAll("#teacherTable tbody tr");

    const teacherCount =
        document.getElementById("teacherCount");

    if (teacherCount) {

        teacherCount.textContent = teacherRows.length;

    }

}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        showPage("dashboard");

        updateDashboardCounts();
        renderSubmissionTracker();

    }
);