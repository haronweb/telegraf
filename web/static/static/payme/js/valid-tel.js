let telInput = document.getElementById('input-phone');

telInput.addEventListener('change', () => {
    telInput.value = telInput.value.replace(/[^0-9]/g, '');;
});