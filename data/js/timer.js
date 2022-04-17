
$('#unitType').on('change', function (v) {
    if ($('#unitType').val() == 0) {
        $('#perc').hide();
        $('#volt').hide();

        $('#unit').fadeIn("slow");
        $('#statusValue').attr('placeholder', valRef);
        $('#statusValue').attr('max', valRef);


    } else if ($('#unitType').val() == 1) {
        $('#unit').hide();
        $('#volt').hide();
        $('#perc').fadeIn("slow");
        $('#statusValue').attr('placeholder', '100');
        $('#statusValue').attr('max', '100');
    } else if ($('#unitType').val() == 2) {
        $('#unit').hide();
        $('#perc').hide();
        $('#volt').fadeIn("slow");
        $('#statusValue').attr('placeholder', vRef);
        $('#statusValue').attr('max', vRef);
    }
    $('#valRef').text(valRef);
    $('#vRef').text(vRef);
    $('#statusValue').val(0);
});



$('#ac_type').change(function () {
                var actionType = $("#ac_type")[0].selectedIndex;
                if (actionType == 0) {
                    $("#sun").prop("disabled", true);
                    $("#mon").prop("disabled", true);
                    $("#tue").prop("disabled", true);
                    $("#wed").prop("disabled", true);
                    $("#thu").prop("disabled", true);
                    $("#fri").prop("disabled", true);
                    $("#sat").prop("disabled", true);
                    $("#years").prop("disabled", false);
                    $("#months").prop("disabled", false);
                    $("#dates").prop("disabled", false);
                    $("#hour").prop("disabled", false);
                } else if (actionType == 1) {
                    $("#sun").prop("disabled", true);
                    $("#mon").prop("disabled", true);
                    $("#tue").prop("disabled", true);
                    $("#wed").prop("disabled", true);
                    $("#thu").prop("disabled", true);
                    $("#fri").prop("disabled", true);
                    $("#sat").prop("disabled", true);
                    $("#years").prop("disabled", true);
                    $("#months").prop("disabled", false);
                    $("#dates").prop("disabled", false);
                } else if (actionType == 2) {
                    $("#sun").prop("disabled", true);
                    $("#mon").prop("disabled", true);
                    $("#tue").prop("disabled", true);
                    $("#wed").prop("disabled", true);
                    $("#thu").prop("disabled", true);
                    $("#fri").prop("disabled", true);
                    $("#sat").prop("disabled", true);
                    $("#years").prop("disabled", true);
                    $("#months").prop("disabled", true);
                    $("#dates").prop("disabled", false);
                } else if (actionType == 3) {
                    $("#sun").prop("disabled", true);
                    $("#mon").prop("disabled", true);
                    $("#tue").prop("disabled", true);
                    $("#wed").prop("disabled", true);
                    $("#thu").prop("disabled", true);
                    $("#fri").prop("disabled", true);
                    $("#sat").prop("disabled", true);
                    $("#years").prop("disabled", true);
                    $("#months").prop("disabled", true);
                    $("#dates").prop("disabled", true);
                    $("#hour").prop("disabled", false);
                } else if (actionType == 4) {
                    $("#sun").prop("disabled", true);
                    $("#mon").prop("disabled", true);
                    $("#tue").prop("disabled", true);
                    $("#wed").prop("disabled", true);
                    $("#thu").prop("disabled", true);
                    $("#fri").prop("disabled", true);
                    $("#sat").prop("disabled", true);
                    $("#years").prop("disabled", true);
                    $("#months").prop("disabled", true);
                    $("#dates").prop("disabled", true);
                    $("#hour").prop("disabled", true);
                }//hourly
                else if (actionType == 5) {
                    $("#sun").prop("disabled", false);
                    $("#mon").prop("disabled", false);
                    $("#tue").prop("disabled", false);
                    $("#wed").prop("disabled", false);
                    $("#thu").prop("disabled", false);
                    $("#fri").prop("disabled", false);
                    $("#sat").prop("disabled", false);
                    $("#years").prop("disabled", true);
                    $("#months").prop("disabled", true);
                    $("#dates").prop("disabled", true);
                    $("#hour").prop("disabled", false);
                    //weekly jan 6 1974 ตรงกับวันอาทิตย์
                }
            });


            $("#save").click(function () {
                var year = 0;
                var delayInMilliseconds = 167; //1 second
                var actionType = $("#ac_type")[0].selectedIndex;
                if (actionType == 0) {
                    year = $('#years').val();
                } else if (actionType == 1) {
                    year = 1972;
                }//yearly
                else if (actionType == 2) {
                    year = 1971;
                }//monthly
                else if (actionType == 3) {
                    year = 1970;
                }//daily
                else if (actionType == 4) {
                    year = 1973;
                }//hourly
                else if (actionType == 5) {
                    year = 1974; //weekly jan 6 1974 ตรงกับวันอาทิตย์
                }

//----------------------------------------------------

                if (actionType == 0) {
                    //one time
                    sendMessage(year, $("#months").val(), $('#dates').val());
                } else if (actionType == 1) {
                    //yearly
                    sendMessage(year, $("#months").val(), $('#dates').val());
                } else if (actionType == 2) {
                    //monthly
                    sendMessage(year, 1, $('#dates').val());
                } else if (actionType == 3) {
                    //daily
                    sendMessage(year, 1, 1);
                } else if (actionType == 4) {
                    //hourly
                    sendMessage(year, 1, 1);
                } else if (actionType == 5) {
                    //ประจำวันอาทิตย์ อ้างอิงจากวันที่ 6 มกราคม 1970
                    if ($('#sun').is(':checked')) {
                        setTimeout(function () {
                            sendMessage(year, 1, 6);
                        }, delayInMilliseconds);
                    }
                    //ประจำวันจันทร์ อ้างอิงจากวันที่ 7 มกราคม 1970
                    if ($('#mon').is(':checked')) {
                        setTimeout(function () {
                            sendMessage(year, 1, 7);
                        }, delayInMilliseconds);
                    }
                    //ประจำวันอังคาร อ้างอิงจากวันที่ 8 มกราคม 1970
                    if ($('#tue').is(':checked')) {
                        setTimeout(function () {
                            sendMessage(year, 1, 8);
                        }, delayInMilliseconds);
                    }
                    //ประจำวันพุธ อ้างอิงจากวันที่ 9 มกราคม 1970
                    if ($('#wed').is(':checked')) {
                        setTimeout(function () {
                            sendMessage(year, 1, 9);
                        }, delayInMilliseconds);
                    }
                    //ประจำวันพฤหัสบดี อ้างอิงจากวันที่ 10 มกราคม 1970
                    if ($('#thu').is(':checked')) {
                        setTimeout(function () {
                            sendMessage(year, 1, 10);
                        }, delayInMilliseconds);
                    }
                    //ประจำวันศุกร์ อ้างอิงจากวันที่ 11 มกราคม 1970
                    if ($('#fri').is(':checked')) {
                        setTimeout(function () {
                            sendMessage(year, 1, 11);
                        }, delayInMilliseconds);
                    }
                    //ประจำวันเสาร์ อ้างอิงจากวันที่ 12 มกราคม 1970
                    if ($('#sat').is(':checked')) {
                        setTimeout(function () {
                            sendMessage(year, 1, 12);
                        }, delayInMilliseconds);
                    }
                }
                //Console.WriteLine(json);
            }
            );

