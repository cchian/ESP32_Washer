Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}
Date.prototype.printLocalTimezone = function () {
    if (typeof moment !== "undefined") {
        var md = moment(this);
        return "GMT" + md.format("Z");
    }
    return '';
}
Date.prototype.epochConverterLocaleString = function (disabletz) {
    disabletz = disabletz || false;
    var locale = getLocale();
    if (typeof moment === "undefined") {
        return this.toDateString() + " " + this.toTimeString();
    }
    moment.locale(locale);
    var md = moment(this);
    if (!md.isValid()) {
        return 'Invalid input.';
    }
    var currentLocaleData = moment.localeData();
    var myLocaleData = moment.localeData(locale);
    var myFormat = myLocaleData.longDateFormat('LLLL');
    if (md.format("SSS") != '000') {
        myFormat = myFormat.replace(":mm", ":mm:ss.SSS");
        myFormat = myFormat.replace(".mm", ".mm.ss.SSS");
    } else {
        myFormat = myFormat.replace(":mm", ":mm:ss");
        myFormat = myFormat.replace(".mm", ".mm.ss");
    }
    if (!disabletz) {
        myFormat += " [GMT]Z";
    }
    var customDate = md.format(myFormat);
    return customDate;
}
Date.prototype.epochConverterGMTString = function () {
    var locale = getLocale();
    if (typeof moment === "undefined") {
        return this.toUTCString();
    }
    moment.locale('en');
    var md = moment(this);
    if (!md.isValid()) {
        return 'Invalid input.';
    }
    var myLocaleData = moment.localeData(locale);
    var myFormat = myLocaleData.longDateFormat('LLLL').replace(/\[([^\]]*)\]/g, " ");
    if (md.format("SSS") != '000') {
        myFormat = myFormat.replace(":mm", ":mm:ss.SSS");
    } else {
        myFormat = myFormat.replace(":mm", ":mm:ss");
    }
    return md.utc().format(myFormat);
}
function getLocale() {
    var locale = getQueryParams('locale');
    var al = [];
    if (typeof moment !== undefined) {
        al = moment.locales();
    }
    if (locale && al.indexOf(locale) > -1)
        return locale;
    return window.navigator.userLanguage || window.navigator.language || "en";
}
function EpochToHuman() {
    var inputtext = $('#ecinput').val();
    inputtext = inputtext.replace(/[`'"\s]+/g, '');
    if (inputtext.charAt(inputtext.length - 1) == "L") {
        inputtext = inputtext.slice(0, -1);
    }
    var hr = "<hr class=\"lefthr\">";
    var errormessage = "Sorry, I can't parse this date.<br/>Check your timestamp, strip letters and punctuation marks.";
    var outputtext = "";
    if ((inputtext.length === 0) || isNaN(inputtext)) {
        if (isHex(inputtext)) {
            inputtext = '0x' + inputtext;
        } else {
            $('#result1').html(errormessage + hr);
            return;
        }
    }
    if (inputtext.substring(0, 2) == '0x') {
        outputtext += 'Converting <a href="/hex?q=' + inputtext.substring(2) + '">hexadecimal timestamp</a> to decimal: ' + parseInt(inputtext) + '<br/>';
    }
    inputtext = inputtext * 1;
    if (!Ax())
        inputtext -= inputtext;
    var epoch = inputtext;
    var extraInfo = 0;
    var rest = 0;
    if ((inputtext >= 100000000000000) || (inputtext <= -100000000000000)) {
        outputtext += "<b>Assuming that this timestamp is in microseconds (1/1,000,000 second):</b><br/>";
        epoch = Math.round(inputtext / 1000000);
        inputtext = Math.round(inputtext / 1000);
    } else if ((inputtext >= 100000000000) || (inputtext <= -100000000000)) {
        outputtext += "<b>Assuming that this timestamp is in milliseconds:</b><br/>";
        epoch = Math.floor(inputtext / 1000);
        rest = inputtext - (epoch * 1000);
    } else {
        if (inputtext < -6857222400) {
            outputtext += "<b>Dates before 14 september 1752 (pre-Gregorian calendar) are not accurate:</b><br/>";
        }
        if (inputtext > 10000000000)
            extraInfo = 1;
        inputtext = (inputtext * 1000);
    }
    var datum = new Date(inputtext);
    if (isValidDate(datum)) {
        var convertedDate = datum.epochConverterGMTString();
        outputtext += "<b>GMT</b>: " + convertedDate;
        outputtext += "<br/><b>Your time zone</b>: <span title=\"" + datum.toDateString() + " " + datum.toTimeString() + "\">" + datum.epochConverterLocaleString(1) + "</span>";
        if (typeof moment !== "undefined") {
            outputtext += " <a title=\"convert to other time zones\" href=\"https://www.epochconverter.com/timezones?q=" + epoch + "\">" + datum.printLocalTimezone() + "</a>";
            var md = moment(datum);
            if (md.isDST()) {
                outputtext += ' <span class="help" title="daylight saving/summer time">DST</span>';
                if (datum.getFullYear() < 1908)
                    outputtext += '<br/><br/>Please note:<br/>DST (Daylight Saving Time) was first used around 1908. JavaScript uses the current DST rules for all dates in history. ';
            }
        }
        if (extraInfo)
            outputtext += "<br/>This conversion uses your timestamp in seconds. Remove the last 3 digits if you are trying to convert milliseconds.";
    } else {
        outputtext += errormessage;
    }
    $('#result1').html(outputtext + hr);
}
function HumanToEpochTZ() {
    var tz = $('#hf select[name=tz]').val();
    var datum;
    var preflink = '<br/>If you prefer another date format, set your <a href="/site/preferences">preferences</a>.';
    var a = $('#result2');
    var mm = $('#hf [name=mm]').val();
    var dd = $('#hf input[name=dd]').val();
    var hh = $('#hf input[name=hh]').val();
    var mn = $('#hf input[name=mn]').val();
    var ss = $('#hf input[name=ss]').val();
    var yyyy = $('#hf input[name=yyyy]').val();
    var warning = '<b>Please check your input.</b><br/>';
    if (yyyy.length === 0 || isNaN(yyyy)) {
        a.html(warning + "Invalid year.");
        return;
    }
    if (mm.length === 0 || isNaN(mm) || mm > 12) {
        a.html(warning + 'Invalid month.' + preflink);
        return;
    }
    if (dd.length === 0 || dd > 31) {
        a.html(warning + 'Invalid day.');
        return;
    }
    if (hh.length === 0 || hh > 23) {
        a.html(warning + 'Invalid hour.');
        return;
    }
    if (mn.length === 0 || mn > 59) {
        a.html(warning + 'Invalid minute.');
        return;
    }
    if (ss.lenght === 0 || ss > 59) {
        a.html(warning + 'Invalid second.');
        return;
    }
    var usedGMT = 0;
    if (tz == 2) {
        datum = new Date(yyyy, mm - 1, dd, hh, mn, ss);
    } else {
        datum = new Date(Date.UTC(yyyy, mm - 1, dd, hh, mn, ss));
        usedGMT = 1;
    }
    var resulttext = "<b>Epoch timestamp</b>: " + (datum.getTime() / 1000.0);
    resulttext += "<br/><span title='Used in Java, JavaScript'>Timestamp in milliseconds: " + datum.getTime() + "</span>";
    resulttext += "<br/>" + (usedGMT ? '<b>' : '') + "Human time (GMT)" + (usedGMT ? '</b>' : '') + ":  " + datum.epochConverterGMTString();
    resulttext += "<br/>" + (usedGMT ? '' : '<b>') + "Human time (your time zone)" + (usedGMT ? '' : '</b>') + ": " + datum.epochConverterLocaleString();
    if (!Ax())
        return;
    $('#result2').html(resulttext);
}
function HumanToEpoch2(loop) {
    loop = loop || 1;
    var strDate = $('input#rcinput').val();
    var mapDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Mon\,', 'Tue\,', 'Wed\,', 'Thu\,', 'Fri\,', 'Sat\,', 'Sun\,', 'Mon ', 'Tue ', 'Wed ', 'Thu ', 'Fri ', 'Sat ', 'Sun ', 'Sun\.', 'Mon\.', 'Tue\.', 'Wed\.', 'Thu\.', 'Fri\.', 'Sat\.', 'Sun\.'];
    if (loop == 2) {
        strDate = translateLocaleToEn(strDate);
    }
    strDate = stripAll(strDate, mapDays);
    strDate = strDate.replace(/[\,]/g, '');
    strDate = strDate.replace(/^\s+|\s+$/g, '');
    strDate = strDate.replace(/ +(?= )/g, '');
    strDate = strDate.replace(/^(\d+)\./, '$1');
    var ok = 0;
    var skipDate = 0;
    var content = "";
    var date = "";
    var format = "";
    var yr = 1970;
    var mnth = 1;
    var dy = 1;
    var hr = 0;
    var mn = 0;
    var sec = 0;
    var dmy = 1;
    if (!ok) {
        var dateTimeSplit = strDate.split(" ");
        var dateParts = dateTimeSplit[0].split("-");
        if (dateParts.length == 1)
            dateParts = dateTimeSplit[0].split(".");
        if (dateParts.length == 1) {
            dmy = 0;
            dateParts = dateTimeSplit[0].split("/");
        }
        if (dateParts.length == 1) {
            dmy = 1;
            if (dateTimeSplit.length > 2) {
                if (dateTimeSplit[2].split(":").length == 1) {
                    strDate = strDate.replace(dateTimeSplit[0] + ' ' + dateTimeSplit[1] + ' ' + dateTimeSplit[2], dateTimeSplit[0] + '-' + dateTimeSplit[1] + '-' + dateTimeSplit[2]);
                    dateTimeSplit = strDate.split(" ");
                    dateParts = dateTimeSplit[0].split("-");
                }
            }
        }
        if (dateParts.length == 1) {
            dateParts = dateTimeSplit;
            if (dateTimeSplit.length > 3)
                timeParts = dateTimeSplit[4];
        }
        if (dateParts.length > 2) {
            if (dateParts[0] > 100) {
                yr = dateParts[0];
                mnth = parseMonth(dateParts[1]);
                dy = dateParts[2];
                format = "YMD";
            } else {
                if (dmy) {
                    dy = dateParts[0];
                    mnth = parseMonth(dateParts[1]);
                    yr = dateParts[2];
                    format = "DMY";
                    if ((!parseFloat(mnth)) || (!parseFloat(dy))) {
                        dy = dateParts[1];
                        mnth = parseMonth(dateParts[0]);
                        format = "MDY";
                    }
                } else {
                    mnth = parseMonth(dateParts[0]);
                    dy = dateParts[1];
                    yr = dateParts[2];
                    format = "MDY";
                    if ((!parseFloat(mnth)) || (!parseFloat(dy))) {
                        dy = dateParts[0];
                        mnth = parseMonth(dateParts[1]);
                        format = "DMY";
                    }
                }
            }
            ok = 1;
        }
        if (ok && dateTimeSplit[1]) {
            var timeParts = dateTimeSplit[1].split(":");
            if (timeParts.length >= 2) {
                hr = timeParts[0];
                mn = timeParts[1];
            }
            if (timeParts.length >= 3) {
                sec = timeParts[2];
            }
            if ((dateTimeSplit[2] && dateTimeSplit[2].toLowerCase() == "pm") && (parseFloat(hr) < 12))
                hr = parseFloat(hr) + 12;
            if ((dateTimeSplit[2] && dateTimeSplit[2].toLowerCase() == "am") && (parseFloat(hr) == 12))
                hr = 0;
        }
    }
    if (!ok) {
        date = new Date(strDate);
        if (date.getFullYear() > 1900) {
            ok = 1;
            skipDate = 1;
        }
    }
    if (ok) {
        if (!skipDate) {
            if (mnth != parseFloat(mnth))
                mnth = parseMonth(mnth);
            if (yr < 30)
                yr = 2000 + parseFloat(yr);
            if (yr < 200)
                yr = 1900 + parseFloat(yr);
            var usedGMT = 0;
            if (((strDate.toUpperCase().indexOf('GMT') > 0) || (strDate.toUpperCase().indexOf('UTC') > 0)) && (strDate.toUpperCase().indexOf('GMT+') == -1) && (strDate.toUpperCase().indexOf('UTC+') == -1)) {
                date = new Date(Date.UTC(yr, mnth - 1, dy, hr, mn, sec));
                usedGMT = 1;
            } else {
                date = new Date(yr, mnth - 1, dy, hr, mn, sec);
            }
        }
        content += "<b>Epoch timestamp</b>: " + (date.getTime() / 1000.0);
        content += "<br/><span title='Used in Java, JavaScript'>Timestamp in milliseconds: " + date.getTime() + "</span>";
        content += "<br/>" + (usedGMT ? '<b>' : '') + "Human time (GMT)" + (usedGMT ? '</b>' : '') + ":  " + date.epochConverterGMTString();
        content += "<br/>" + (usedGMT ? '' : '<b>') + "Human time (Your time zone)" + (usedGMT ? '' : '</b>') + ": " + date.epochConverterLocaleString();
    }
    if ((!content) || (date.getTime() != parseFloat(date.getTime()))) {
        if (loop == 1) {
            HumanToEpoch2(2);
            return;
        }
        content = 'Sorry, can\'t parse this date.';
    }
    if (!Ax())
        return;
    $('#result3').html(content);
}
function secondsSince0(offset) {
    var formname = "s2t";
    if (offset)
        formname += "2";
    var val = parseInt(document.getElementById(formname).value);
    val -= 62167219200;
    if (offset) {
        val += offset;
    }
    var datum = new Date(val * 1000);
    outputtext = "<b>GMT</b>: " + datum.epochConverterGMTString() + "<br/><b>Your time zone</b>: " + datum.epochConverterLocaleString();
    document.getElementById('result' + formname).innerHTML = outputtext;
}
function daysSince0(offset) {
    var formname = "d2t";
    if (offset)
        formname += "2";
    var val = parseInt(document.getElementById(formname).value);
    if (offset) {
        val = offset + val;
    }
    val = (val * 86400) - 62167219200;
    var datum = new Date(val * 1000);
    outputtext = "<b>Conversion result</b>: " + datum.toDateString();
    document.getElementById('result' + formname).innerHTML = outputtext;
}
function hexToHuman() {
    var hex = document.getElementById('hextime').value;
    dec = parseInt(hex, 16);
    var datum = new Date(dec * 1000);
    outputtext = "<b>GMT</b>: " + datum.epochConverterGMTString() + "<br/><b>Your time zone</b>: " + datum.epochConverterLocaleString();
    outputtext += "<br/>Decimal timestamp/epoch: " + dec;
    document.getElementById('resulthex').innerHTML = outputtext;
}
function TimeCounter() {
    var t = parseInt(document.tc.DateTime.value);
    var days = parseInt(t / 86400);
    t = t - (days * 86400);
    var hours = parseInt(t / 3600);
    t = t - (hours * 3600);
    var minutes = parseInt(t / 60);
    t = t - (minutes * 60);
    var content = "";
    if (days)
        content += days + " days";
    if (hours || days) {
        if (content)
            content += ", ";
        content += hours + " hours";
    }
    if (content)
        content += ", ";
    content += minutes + " minutes and " + t + " seconds.";
    document.getElementById('result4').innerHTML = content;
}
var currentBeginEnd = "month";
function updateBe(a) {
    if (a != currentBeginEnd) {
        if (a == "day") {
            document.br.mm.disabled = 0;
            document.br.dd.disabled = 0;
        }
        if (a == "month") {
            document.br.mm.disabled = 0;
            document.br.dd.disabled = 1;
        }
        if (a == "year") {
            document.br.mm.disabled = 1;
            document.br.dd.disabled = 1;
        }
        currentBeginEnd = a;
        beginEnd();
    }
}
function beginEnd() {
    var tz = $('#br select[name=tz]').val();
    var a = document.getElementById('resultbe');
    if (currentBeginEnd != "year" && (document.br.mm.value > 12)) {
        a.innerHTML = '<b>Please check your input.</b><br/>Invalid month: ' + document.br.mm.value;
        return;
    }
    if (currentBeginEnd == "day" && (document.br.dd.value > 31)) {
        a.innerHTML = '<b>Please check your input.</b><br/>Invalid day: ' + document.br.dd.value;
        return;
    }
    var outputText = "<table class=\"infotable\"><tr><td></td><td><b>Epoch</b></td><td>&nbsp;&nbsp;<b>Human date</b></td></tr><tr><td>Start of " + currentBeginEnd + ":&nbsp;</td><td>";
    var mon = 0;
    var day = 1;
    var yr = document.br.yyyy.value;
    if (currentBeginEnd != "year") {
        mon = document.br.mm.value - 1;
    }
    if (currentBeginEnd == "day") {
        day = document.br.dd.value;
    }
    var startDate;
    if (tz == 2) {
        startDate = new Date(yr, mon, day, 0, 0, 0);
    } else {
        startDate = new Date(Date.UTC(yr, mon, day, 0, 0, 0));
    }
    if (currentBeginEnd == "year")
        yr++;
    if (currentBeginEnd == "month")
        mon++;
    if (currentBeginEnd == "day")
        day++;
    var endDate;
    if (tz == 2) {
        endDate = new Date(yr, mon, day, 0, 0, -1);
    } else {
        endDate = new Date(Date.UTC(yr, mon, day, 0, 0, -1));
    }
    outputText += (startDate.getTime() / 1000.0) + "</td><td>&nbsp;&nbsp;";
    if (tz == 2) {
        outputText += startDate.epochConverterLocaleString();
    } else {
        outputText += startDate.epochConverterGMTString();
    }
    outputText += "</td></tr>";
    outputText += "<tr><td>End of " + currentBeginEnd + ":&nbsp;</td><td>";
    outputText += (endDate.getTime() / 1000.0) + "</td><td>&nbsp;&nbsp;";
    if (tz == 2) {
        outputText += endDate.epochConverterLocaleString();
    } else {
        outputText += endDate.epochConverterGMTString();
    }
    outputText += "</td></tr>";
    a.innerHTML = outputText;
}
function homepageStart() {
    if ($("#ecclock").length != 0) {
        var clockActive = 1;
        $("#ecclock").mouseover(function () {
            clockActive = 0;
            $("#clocknotice").html('<i class="fa fa-pause" aria-hidden="true"></i>').show();
            setTimeout(resetClockNotice, 1000);
        });
        $("#ecclock").mouseout(function () {
            clockActive = 1;
            $("#clocknotice").html('');
        });
        setInterval(function () {
            if (clockActive) {
                var epoch = Math.round(new Date().getTime() / 1000.0);
                $("#ecclock").html(epoch);
            }
        }, 1000);
    }
    var today = new Date();
    $('#ecinput').val(Math.round(today.getTime() / 1000.0));
    if (preferredtz == 2) {
        $('select[name=mm],input:text[name=mm]').val(today.getMonth() + 1);
        $('input:text[name=yyyy]').val(today.getFullYear());
        $('input:text[name=dd]').val(today.getDate());
        $('input:text[name=hh]').val(today.getHours());
        $('input:text[name=mn]').val(today.getMinutes());
    } else {
        $('select[name=mm],input:text[name=mm]').val(today.getUTCMonth() + 1);
        $('input:text[name=yyyy]').val(today.getUTCFullYear());
        $('input:text[name=dd]').val(today.getUTCDate());
        $('input:text[name=hh]').val(today.getUTCHours());
        $('input:text[name=mn]').val(today.getUTCMinutes());
    }
    $('input:text[name=ss]').val(today.getUTCSeconds());
    $('#fs input:text[name=DateTime]').val(today.toUTCString());
    $(document).keypress(function (e) {
        if (!$(e.target).is('input#ecinput, input#rcinput')) {
            if (!(e.ctrlKey || e.altKey || e.metaKey)) {
                if (String.fromCharCode(e.which).match(/[a-zA-Z]/))
                    e.preventDefault();
                switch (e.which) {
                    case 101:
                    case 69:
                        kp('ecinput');
                        jumpTo('top');
                        break;
                        case 99:
                    case 67:
                        emptyFields();
                        break;
                        case 104:
                    case 72:
                        kp('hcinput');
                        jumpTo('top');
                        break;
                        case 114:
                    case 82:
                        kp('rcinput');
                        jumpTo('fs');
                        break;
                        case 115:
                    case 83:
                        kp('scinput');
                        jumpTo('tchead');
                        break;
                        case 121:
                    case 89:
                        $('input:radio[name=cw]:nth(0)').attr('checked', true);
                        updateBe('year');
                        jumpTo('brhead');
                        kp('ycinput');
                        break;
                        case 109:
                    case 77:
                        $('input:radio[name=cw]:nth(1)').attr('checked', true);
                        updateBe('month');
                        jumpTo('brhead');
                        if (dateformat == "3") {
                            kp('ycinput');
                        } else {
                            kp('mcinput');
                        }
                        break;
                        case 100:
                    case 68:
                        $('input:radio[name=cw]:nth(2)').attr('checked', true);
                        updateBe('day');
                        jumpTo('brhead');
                        if (dateformat == "2") {
                            kp('dcinput');
                        } else if (dateformat == "3") {
                            kp('ycinput');
                        } else {
                            kp('mcinput');
                        }
                        break;
                        }
            }
        }
    });
}
function resetClockNotice() {
    $("#clocknotice").hide();
}
function timezoneStart() {
    $(document).keypress(function (e) {
        if (!(e.ctrlKey || e.altKey || e.metaKey)) {
            if (String.fromCharCode(e.which).match(/[a-zA-Z]/))
                e.preventDefault();
            switch (e.which) {
                case 101:
                case 69:
                    kp('ecinput');
                    jumpTo('top');
                    break;
                    }
        }
    });
}
function jumpTo(toid) {
    var new_position = $('#' + toid).offset();
    window.scrollTo(new_position.left, new_position.top);
}
function emptyFields() {
    $('input:text').val("");
    $(".resultbox").fadeOut('', function () {
        $(".resultbox").html('').show();
    });
}
function kp(id) {
    $('#' + id).focus();
    $('#' + id).select();
}
function parseMonth(mnth) {
    switch (mnth.toLowerCase()) {
        case 'january':
        case 'jan':
        case 'enero':
            return 1;
            case 'february':
        case 'feb':
        case 'febrero':
            return 2;
            case 'march':
        case 'mar':
        case 'marzo':
            return 3;
            case 'april':
        case 'apr':
        case 'abril':
            return 4;
            case 'may':
        case 'mayo':
            return 5;
            case 'jun':
        case 'june':
        case 'junio':
            return 6;
            case 'jul':
        case 'july':
        case 'julio':
            return 7;
            case 'aug':
        case 'august':
        case 'agosto':
            return 8;
            case 'sep':
        case 'september':
        case 'septiembre':
        case 'setiembre':
            return 9;
            case 'oct':
        case 'october':
        case 'octubre':
            return 10;
            case 'nov':
        case 'november':
        case 'noviembre':
            return 11;
            case 'dec':
        case 'december':
        case 'diciembre':
            return 12;
        }
    return mnth;
}
function isValidDate(d) {
    if (Object.prototype.toString.call(d) !== "[object Date]")
        return false;
    return!isNaN(d.getTime());
}
function isHex(h) {
    var a = parseInt(h, 16);
    return(a.toString(16) === h.toLowerCase())
}
function Ax() {
    var d = $(location).attr('hostname');
    if ((d.search(/sja/i) > 0) || (d.search(/hcon/i) > 3) || d.search(/ogl/i) > 0) {
        return 1;
    } else {
        return 0;
    }
}
function UpdateTableHeaders() {
    $(".persist-area").each(function () {
        var el = $(this), offset = el.offset(), scrollTop = $(window).scrollTop(), floatingHeader = $(".floatingHeader", this)
        if ((scrollTop > offset.top) && (scrollTop < offset.top + el.height())) {
            floatingHeader.css({"visibility": "visible"});
        } else {
            floatingHeader.css({"visibility": "hidden"});
        }
        ;
    });
}
function stripAll(str, mapDays) {
    var re = new RegExp(mapDays.join("|"), "gi");
    return str.replace(re, '');
}
function replaceAll(str, mapObj) {
    var keysstr = Object.keys(mapObj).join("|");
    if (!keysstr)
        return str;
    keysstr = keysstr.replace(/\./g, '\\.');
    var re = new RegExp(keysstr, "i");
    return str.replace(re, function (matched) {
        return mapObj[matched.toLowerCase()];
    });
}
function replaceArray1withArray2(str, a1, a2) {
    var obj = {};
    for (var i = 0, l = a1.length; i < l; i++) {
        s = a1[i];
        t = a2[i];
        if (s != t) {
            obj[s.toLowerCase()] = t;
        }
    }
    str = replaceAll(str, obj);
    return str;
}
function translateLocaleToEn(str) {
    var locale = getLocale();
    if (typeof moment === "undefined")
        return str;
    if (locale.substring(0, 2) == 'en')
        return str;
    moment.locale(locale);
    monthsA = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    inA = moment.months();
    str = replaceArray1withArray2(str, inA, monthsA);
    inB = moment.monthsShort();
    str = replaceArray1withArray2(str, inB, monthsA);
    daysA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    inC = moment.weekdays();
    str = replaceArray1withArray2(str, inC, daysA);
    inD = moment.weekdaysShort();
    str = replaceArray1withArray2(str, inD, daysA);
    return str;
}
function getQueryParams(qn) {
    var qs = document.location.search;
    qs = qs.split('+').join(' ');
    var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;
    while (tokens = re.exec(qs)) {
        if (qn == "locale" && decodeURIComponent(tokens[1]) == 'locale')
            return decodeURIComponent(tokens[2]);
    }
    return false;
}