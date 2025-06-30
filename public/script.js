function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = passwordInput.nextElementSibling;
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.textContent = "🙈";
    } else {
        passwordInput.type = "password";
        eyeIcon.textContent = "👁️";
    }
}

function showForm(formId) {
    const forms = document.querySelectorAll(".form");
    forms.forEach(form => {
        form.classList.remove("active");
    });
    document.getElementById(formId).classList.add("active");
}