/* ==================================
   ANHS SMARTSCHOOL JAVASCRIPT
================================== */


/* ================================
   LOGIN / AUTHENTICATION
================================ */

/* Demo accounts. In a real system these would be
   verified against the school's database, with each
   adviser account tied to their assigned advisory
   section so they only encode their own students. */

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
    ["navTeachers", "navClasses", "navRecords", "navParents", "navReports", "navSettings"];


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


    /* Students page: advisers only see and add
       students belonging to their own section */

    if (isAdviser) {

        document.getElementById("studentsPageTitle").textContent =
            "My Advisory - " + account.grade + " " + account.section;

        document.getElementById("studentsPageSubtitle").textContent =
            "Encode and manage students under your advisory class only.";

    } else {

        document.getElementById("studentsPageTitle").textContent =
            "Student Management";

        document.getElementById("studentsPageSubtitle").textContent =
            "Manage student information and enrollment.";

    }

    filterStudentsForCurrentUser();
    applyStudentModalLock();

}


function filterStudentsForCurrentUser() {

    const rows =
        document.querySelectorAll("#studentTable tbody tr");

    rows.forEach(function(row) {

        if (!currentUser || currentUser.role === "admin") {

            row.classList.remove("hidden");
            return;

        }

        const matches =
            row.dataset.grade === currentUser.grade &&
            row.dataset.section === currentUser.section;

        row.classList.toggle("hidden", !matches);

    });

}


function applyStudentModalLock() {

    const gradeField =
        document.getElementById("newStudentGrade");

    const sectionField =
        document.getElementById("newStudentSection");

    if (!gradeField || !sectionField) {

        return;

    }

    if (currentUser && currentUser.role === "adviser") {

        gradeField.value = currentUser.grade;
        gradeField.disabled = true;

        sectionField.value = currentUser.section;
        sectionField.readOnly = true;

    } else {

        gradeField.disabled = false;

        sectionField.value = "";
        sectionField.readOnly = false;

    }

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

    students: {
        title: "Students",
        subtitle: "Manage student information and enrollment."
    },

    teachers: {
        title: "Teachers",
        subtitle: "Manage faculty information and assignments."
    },

    classes: {
        title: "Classes & Subjects",
        subtitle: "Manage classes, sections and subjects."
    },

    syllabus: {
        title: "Syllabus",
        subtitle: "Senior High School program syllabus per track and cluster."
    },

    lessonplans: {
        title: "Lesson Plans / DLL",
        subtitle: "Prepare and track daily lesson logs."
    },

    grades: {
        title: "Grades",
        subtitle: "Manage student grades and assessments."
    },

    schedule: {
        title: "Schedule",
        subtitle: "Manage school schedules and room assignments."
    },

    attendance: {
        title: "Attendance",
        subtitle: "Monitor daily student attendance."
    },

    announcements: {
        title: "Announcements",
        subtitle: "Manage school announcements and notices."
    },

    records: {
        title: "Student Records",
        subtitle: "Access and manage student records."
    },

    parents: {
        title: "Parents / Guardians",
        subtitle: "Manage parent and guardian information."
    },

    reports: {
        title: "Reports",
        subtitle: "Generate school management reports."
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
   STUDENT SEARCH
================================ */

const studentSearch =
    document.getElementById("studentSearch");

if (studentSearch) {

    studentSearch.addEventListener("input", function() {

        const searchValue =
            this.value.toLowerCase();

        const rows =
            document.querySelectorAll(
                "#studentTable tbody tr"
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
   STUDENT MODAL
================================ */

const modal =
    document.getElementById("studentModal");

const addStudentBtn =
    document.getElementById("addStudentBtn");

const closeModal =
    document.getElementById("closeModal");

const cancelModal =
    document.getElementById("cancelModal");


function openStudentModal() {

    applyStudentModalLock();

    modal.classList.add("show");

}


function hideStudentModal() {

    modal.classList.remove("show");

}


if (addStudentBtn) {

    addStudentBtn.addEventListener(
        "click",
        openStudentModal
    );

}


closeModal.addEventListener(
    "click",
    hideStudentModal
);


cancelModal.addEventListener(
    "click",
    hideStudentModal
);


/* Close modal by clicking background */

modal.addEventListener("click", function(event) {

    if (event.target === modal) {

        hideStudentModal();

    }

});


/* ================================
   ADD STUDENT
================================ */

const studentForm =
    document.getElementById("studentForm");


studentForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const id =
            document.getElementById(
                "newStudentId"
            ).value;

        const name =
            document.getElementById(
                "newStudentName"
            ).value;

        const grade =
            document.getElementById(
                "newStudentGrade"
            ).value;

        const section =
            document.getElementById(
                "newStudentSection"
            ).value;


        const tbody =
            document.querySelector(
                "#studentTable tbody"
            );


        const row =
            document.createElement("tr");

        row.dataset.grade = grade;
        row.dataset.section = section;


        row.innerHTML = `

            <td>${id}</td>

            <td>${name}</td>

            <td>${grade}</td>

            <td>${section}</td>

            <td>
                <span class="status active">
                    Active
                </span>
            </td>

            <td>

                <button class="table-btn">

                    <i class="fa-solid fa-eye"></i>

                </button>

            </td>

        `;


        tbody.appendChild(row);


        /* Update student count */

        const countElement =
            document.getElementById(
                "studentCount"
            );


        let currentCount =
            parseInt(
                countElement.textContent.replace(
                    ",",
                    ""
                )
            );


        currentCount++;


        countElement.textContent =
            currentCount.toLocaleString();


        studentForm.reset();

        applyStudentModalLock();

        hideStudentModal();


        alert(
            "Student successfully added to ANHS SmartSchool."
        );

    }
);


/* ================================
   SYLLABUS TABS
================================ */

const syllabusTabs =
    document.querySelectorAll(".syllabus-tab");

const syllabusPanels =
    document.querySelectorAll(".syllabus-panel");


syllabusTabs.forEach(tab => {

    tab.addEventListener("click", function() {

        syllabusTabs.forEach(t => {
            t.classList.remove("active");
        });

        syllabusPanels.forEach(panel => {
            panel.classList.remove("active");
        });

        this.classList.add("active");

        const targetPanel =
            document.getElementById(
                `syllabus-${this.dataset.syllabus}`
            );

        if (targetPanel) {
            targetPanel.classList.add("active");
        }

    });

});


const printSyllabusBtn =
    document.getElementById("printSyllabusBtn");

if (printSyllabusBtn) {

    printSyllabusBtn.addEventListener(
        "click",
        function() {
            window.print();
        }
    );

}


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
   LESSON PLAN WEEK OPTIONS (1-20)
================================ */

const newLessonWeek =
    document.getElementById("newLessonWeek");

if (newLessonWeek) {

    const placeholderOption =
        document.createElement("option");

    placeholderOption.value = "";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    placeholderOption.textContent = "Select week";

    newLessonWeek.appendChild(placeholderOption);

    for (let week = 1; week <= 20; week++) {

        const option =
            document.createElement("option");

        option.textContent = `Week ${week}`;

        newLessonWeek.appendChild(option);

    }

}


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


            row.innerHTML = `

                <td>${formattedDate}</td>

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

                <td>
                    <span class="file-chip">
                        <i class="fa-solid ${fileIcon}"></i>
                        ${file.name}
                    </span>
                </td>

                <td>
                    <span class="status active">
                        Submitted
                    </span>
                </td>

                <td>

                    <button class="table-btn">

                        <i class="fa-solid fa-eye"></i>

                    </button>

                </td>

            `;


            tbody.appendChild(row);


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
   REPORT BUTTONS
================================ */

document.querySelectorAll(
    ".report-card .outline-btn"
).forEach(button => {

    button.addEventListener(
        "click",
        function() {

            alert(
                "Report generation will be connected to the database."
            );

        }
    );

});


/* ================================
   INITIALIZE
================================ */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        showPage("dashboard");

    }
);