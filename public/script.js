function showForm(formId) {
    const container = document.getElementById('container');
    if (formId === 'signup-form') {
        container.classList.add('signup-active');
    } else {
        container.classList.remove('signup-active');
    }
}

function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = passwordInput.nextElementSibling;
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}