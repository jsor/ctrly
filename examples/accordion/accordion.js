(function() {
    function setMaxHeight(target) {
        var height = target.querySelector('.accordion-target-inner').offsetHeight;
        target.style.maxHeight = height + 'px';
    }

    ctrly({
        context: '.accordion',
        closeOnBlur: false,
        closeOnEsc: false,
        closeOnOutsideClick: false,
        focusTarget: false,
        on: {
            open: setMaxHeight,
            close: function(target) {
                target.style.maxHeight = '0px';
            }
        }
    });

    document.addEventListener('DOMContentLoaded', function() {
        var expandedControls = [].slice.call(
            document.querySelectorAll('.accordion-control[aria-expanded="true"]')
        );

        expandedControls.forEach(function(control) {
            var targetId = control.getAttribute('aria-controls');

            setMaxHeight(
                document.getElementById(targetId)
            );
        });
    });
})();
