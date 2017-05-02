(function () {

    var tabContent = $(".tabContent"),
       // aboutView = $("#aboutView"),
       // zmanimView = $("#zmanimView"),
        tabClick = $(".tabClick");

    tabClick.click(function () {

        event.preventDefault();
        
        // removing active class
        tabClick.removeClass("active");
        // adding active class to this
        $(this).addClass("active");
        //hiding all content
        tabContent.hide();
        //show content of clickedtab
        var activeTab = $(this).children('a').attr("href");
        console.log(activeTab);
        $(activeTab).show();





    });

}());