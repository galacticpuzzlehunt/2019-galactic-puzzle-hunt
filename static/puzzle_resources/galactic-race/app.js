$(function () {
    var popUps = $('.attatchment');
    popUps.each((i, e) => {
        popUp = $(e.attributes[0].value);
        popUp.dialog({
            autoOpen: false, show: "blind", hide: "blind", width: 500, title: "Click on the image for a larger version"
        });
    });

    popUps.click(function () {
        var id = this.attributes[0].value;
        $(id).dialog("open");
    });
})