(function () {

    var zmanimFormButton = $('#zmanimFormButton'),
        backButton = $('#backButton'),
        zmanimForm = $('#zmanimForm'),
        zmanimdata = $('#zmanimdata'),
        zmanimFormPlace = $('#zmanimFormPlace'),
        datepicker = $('#datepicker'),
        placesList = $('#placesList'),
        googleMapsAPICodegeocoding = 'AIzaSyA1z98iSEhmGKUKO7quZrIOezsWa1EPElw',
        googleMapsAPICodeTimezone = 'AIzaSyDlAtZCGP9bp2dUXeZYnHmLhOyoeytlWfM';



    backButton.click(function () {
        console.log("backbutton");
        zmanimForm.show();
        placesList.hide().empty();
        zmanimdata.hide().empty();
        zmanimFormPlace.val("");
    });
    zmanimFormButton.click(function () {
        if (!zmanimFormPlace.val()) {
            zmanimFormPlace.css("background-color", "red");
        } else {
            //console.log('clicked button', zmanimFormPlace.val());
            $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?address=' + zmanimFormPlace.val() + '&key=' + googleMapsAPICodegeocoding,
                function (data) {
                    //check if return multiple location

                    // checking if google geocoding returned something
                    //  if (data.status == 'ok') {


                    // console.log(data.results);
                    data.results.forEach(function (places) {
                        zmanimForm.hide();

                        placesList.show().append("<li class='well well-sm' id=" + places.place_id + ">" + places.formatted_address + '</li>');

                        $("#" + places.place_id).click(function (data) {
                            console.log(places);
                            placesList.hide();

                            // getting time zone
                            var timeZoneOffSet = getTimeZone(places.geometry.location, datepicker.val());
                            console.log("timezone offset 1", timeZoneOffSet);

                            //console.log('date', datepicker.val());
                            // console.log("ajax request", 'http://api.sunrise-sunset.org/json?lat=' + places.geometry.location.lat + '&lng=' + places.geometry.location.lng + '&date=' + datepicker.val());
                            $.getJSON('http://api.sunrise-sunset.org/json?lat=' + places.geometry.location.lat + '&lng=' + places.geometry.location.lng + '&date=' + datepicker.val(),
                                //{lat: places.geometry.location.lat , lng: places.geometry.location.lng, date: datepicker.val() },
                                function (data) {
                                    // console.log('getting sunset sunrise', data);

                                    //listtimes(data);
                                    // var time = data.results.sunset;
                                    var date = datepicker.val();
                                    var unixDate = Date.parse(date);
                                    var sunsetintimezone = timeZoneOffSet + unixDate / 1000;
                                    listtimes(data, date, timeZoneOffSet);

                                    //  console.log(convertTimestamp(sunsetintimezone));
                                });
                            zmanimForm.hide();
                            zmanimdata.show();

                        });
                    });
                    // } else {
                    //if returned a error...
                    //    console.log('error google maps status not === ok');
                    // }
                });







        }
    });

    function listtimes(data, date, thetimeZoneOffset) {
        var sunrise = data.results.sunrise,
            sunset = data.results.sunset,
            sunsetString = convertToTimeZone(sunset, date, thetimeZoneOffset),
            sunriseString = convertToTimeZone(sunrise, date, thetimeZoneOffset),
            midday = convertToTimeZone(convertToMidday(sunrise, sunset, date), date, thetimeZoneOffset),
            sunrisegh = convertToTimeZone(sunrisegoldenhour(sunrise, date), date, thetimeZoneOffset),
            sunsetgh = convertToTimeZone(sunsetgoldenhour(sunset, date), date, thetimeZoneOffset);


        zmanimdata.append('<p> sunrise:' + sunriseString + '</p>',
            '<p> moring golden hour untill:' + sunrisegh + ' </p>',
            '<p> midday:' + midday + '</p>',
            '<p> evening golden hour from:' + sunsetgh + ' </p>',
            '<p> sunset:' + sunsetString + '</p>');
    }


    function sunrisegoldenhour(sunrise, date) {
        var rise = Date.parse(new Date(date + " " + sunrise).toISOString()),
            sunriseghunixtime = rise + (3600 * 1000);
        // console.log('gh rise', rise);
        // console.log('gh rise + 60', sunriseghunixtime);
        return convertTimestamp(sunriseghunixtime / 1000);
    }

    function sunsetgoldenhour(sunset, date) {
        var set = Date.parse(new Date(date + " " + sunset).toISOString()),
            sunrissetghunixtime = set - (3600 * 1000);

        return convertTimestamp(sunrissetghunixtime / 1000);

    }

    function convertToMidday(sunrise, sunset, date) {
        var rise = Date.parse(new Date(date + " " + sunrise).toISOString()),
            set = Date.parse(new Date(date + " " + sunset).toISOString()),
            midunixtime = rise + ((set - rise) / 2);

        //console.log("sunrise ", sunrise);
        //console.log("MIDDAY ", new Date(rise + ((set - rise) / 2)));
        //console.log('convertedtimestampmidday ', convertTimestamp(midunixtime));
        return convertTimestamp(midunixtime / 1000);


    }

    function convertToTimeZone(time, date, tzOffset) {
        // converting time and date to a string 
        var datePlusTime = new Date(date + " " + time).toISOString();
        /// converting to unix time
        var unixdate = Date.parse(datePlusTime);
        // adding timezone offset
        var timeWithOffset = tzOffset + unixdate / 1000;
        return convertTimestamp(timeWithOffset);

    }



    function getTimeZone(location, theDate) {
        var timestamp = Math.floor(new Date(theDate).getTime()) / 1000,
            offSet;
        //console.log('timestamp', timestamp);
        $.ajax({
            dataType: "json",
            url: "https://maps.googleapis.com/maps/api/timezone/json?location=" + location.lat + ',' + location.lng + "&timestamp=" + timestamp + "&key=" + googleMapsAPICodeTimezone,

            success: function (data) {
                console.log('gettimezone info', data);
                console.log('gettimezone timezone', data.rawOffset / 60 / 60);
                console.log("combine offset", data.rawOffset + data.dstOffset);
                offSet = data.rawOffset + data.dstOffset;

            },
            async: false
        });

        return offSet;
    }

    function convertTimestamp(timestamp) {
        var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
            dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
            sec = d.getSeconds(),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh == 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM	
        // time with date 
        //time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ':' + sec + ' ' + ampm;
        // time without date
        time = h + ':' + min + ':' + sec + ' ' + ampm;

        return time;
    }


}());