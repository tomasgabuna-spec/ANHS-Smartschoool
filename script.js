/* ==================================
   ANHS SMARTSCHOOL JAVASCRIPT
================================== */


/* ================================
   LOGIN / AUTHENTICATION
================================ */

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

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


function showApp() {

    loginPage.classList.add("hidden");
    appRoot.classList.remove("hidden");

}


function showLoginPage() {

    appRoot.classList.add("hidden");
    loginPage.classList.remove("hidden");

    loginError.classList.remove("show");

    if (loginForm) {

        loginForm.reset();

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


            const isValid =
                username === DEMO_USERNAME &&
                password === DEMO_PASSWORD;


            if (isValid) {

                loginError.classList.remove("show");

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

        hideStudentModal();


        alert(
            "Student successfully added to ANHS SmartSchool."
        );

    }
);


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

            const quarter =
                document.getElementById(
                    "newLessonQuarter"
                ).value;

            const subject =
                document.getElementById(
                    "newLessonSubject"
                ).value;

            const section =
                document.getElementById(
                    "newLessonSection"
                ).value;

            const topic =
                document.getElementById(
                    "newLessonTopic"
                ).value;

            const status =
                document.getElementById(
                    "newLessonStatus"
                ).value;


            const formattedDate =
                rawDate
                    ? new Date(rawDate + "T00:00:00")
                        .toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        })
                    : "";


            const statusClass =
                status === "Draft"
                    ? "pending"
                    : "active";


            const tbody =
                document.querySelector(
                    "#lessonPlanTable tbody"
                );


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${formattedDate}</td>

                <td>${subject}</td>

                <td>${section}</td>

                <td>${quarter}</td>

                <td>${topic}</td>

                <td>
                    <span class="status ${statusClass}">
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


            lessonPlanForm.reset();

            hideLessonPlanModal();


            alert(
                "Lesson plan successfully saved to ANHS SmartSchool."
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