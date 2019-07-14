var urlParams = new URLSearchParams(window.location.search);
var position = (urlParams.get('page') || 1) - 1;
var pages = [];

$(document).ready(function() {
    pages = $(".page");
    if (position != 0) {
        pages.eq(0).toggle();
        pages.eq(position).toggle();
    }

    $("#prev-button").click(function() {
        if (position > 0) {
            pages.eq(position).toggle();
            --position;
            pages.eq(position).toggle();
            $('.puflantu-header', pages.eq(position)).css("display", "inline-block");
        }
    });

    $("#next-button").click(function() {
        if (position < pages.length - 1) {
            pages.eq(position).toggle();
            ++position;
            pages.eq(position).toggle();
            $('.puflantu-header', pages.eq(position)).css("display", "inline-block");
        }
    });
});
