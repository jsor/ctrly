ctrly({
    context: '.accordion',
    closeOnBlur: false,
    closeOnEsc: false,
    closeOnOutsideClick: false,
    focusTarget: false,
    on: {
        open: function(target) {
            var height = target.querySelector('.accordion-target-inner').offsetHeight;
            target.style.maxHeight = height + 'px';
        },
        close: function(target) {
            target.style.maxHeight = '0px';
        }
    }
});
