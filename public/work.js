function validateForm() {
            const title = document.querySelector('input[name="title"]').value;
            const description = document.querySelector('textarea[name="description"]').value;
            const file = document.querySelector('input[name="file"]').value;
            if (!title || !description || !file) {
                alert('Please fill in all fields');
                return false;
            }
            return true;
        }