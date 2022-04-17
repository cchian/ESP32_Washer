var DIR_NONE = 0
var DIR_CW = 1
var DIR_CCW = 2
var DIR_LOOP = 3

var WTR_HOLD = 0
var WTR_LOAD = 1
var WTR_DRAIN = 2

var BUSY = 1
var OK = 0
var ON = 0
var OFF = 1


var IDLE = 0
var ALARM = 1
var RUN = 2
var JOG = 3
var ACTION_STOP = 0
var ACTION_WASHING = 1
var ACTION_DRYING = 2
var ACTION_WATER_FLOW_IN = 3
var ACTION_WATER_FLOW_OUT = 4

var status;
var currentAction;
var washing_time_counter;
var washing_timer_buff;
var waiting = 0;
var water_level = 0;
var water_raw = 0;
var current_direction;
var FlOW_IN_PIN;
var SPEED_FLOW_OUT_PIN;
var runtime;
var totalTime;
var washing_auto;
var c = document.getElementById("cv");
var ctx = c.getContext("2d");
ctx.font = "30px BoonJot";
var img = new Image();
var img2 = new Image();
var imgInfoIcon = new Image();
var imgInfoIconBW = new Image();
function tTimes(secs) {
    var h = secs / 3600;
    var rem = secs % 3600;
    var m = parseInt(rem / 60);
    var s = parseInt(rem % 60);
    return ((m < 10) ? "0" : "") + m + ":" + ((s < 10) ? "0" : "") + s;
}


function maxWindow() {
    window.moveTo(0, 0);
    if (document.all) {
        top.window.resizeTo(screen.availWidth, screen.availHeight);
    } else if (document.layers || document.getElementById) {
        if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < screen.availWidth) {
            top.window.outerHeight = screen.availHeight;
            top.window.outerWidth = screen.availWidth;
        }
    }
}
window.onload = maxWindow;
//var water_level=50;

var bin = false;
$(document).ready(function () {
    //alert('ddd'); 

    img.src = "./img/washer.png";
    img2.src = "./img/spinner.png";
    imgInfoIcon.src = "./img/infoicon.png";
    imgInfoIconBW.src = "./img/infoiconBW.png";
    imgInfoIcon.onload = function () {
        setInterval(function () {
            var pw = 20, ph = 20;
            var px = 10, ipx;
            var py = 20, ipy = 5;
            //status = RUN;
            //waiting=10;
            //currentAction=ACTION_DRYING;
            if (status == IDLE) {
                ctx.drawImage(imgInfoIcon, 0, 0, pw, ph, px, py, pw, ph); //idle
            } else {
                //ctx.clearRect(imgInfoIcon, px, py, pw, ph);
                ctx.drawImage(imgInfoIconBW, 0, 0, pw, ph, px, py, pw, ph); //idle
            }

            py += (ph + ipy);
            if (FlOW_IN_PIN == 1) {
                ctx.drawImage(imgInfoIcon, 20, 0, pw, ph, px, py, pw, ph);//water loading
            } else {
                //ctx.clearRect(imgInfoIcon, px, py, pw, ph);
                ctx.drawImage(imgInfoIconBW, 20, 0, pw, ph, px, py, pw, ph);//water loading
            }
            py += (ph + ipy);
            if (currentAction == ACTION_WASHING && washing_time_counter == 0) {
                ctx.drawImage(imgInfoIcon, 40, 0, pw, ph, px, py, pw, ph);//washing...1
            } else {
                //ctx.clearRect(imgInfoIcon, px, py, pw, ph);
                ctx.drawImage(imgInfoIconBW, 40, 0, pw, ph, px, py, pw, ph);//washing...1
            }

            py += (ph + ipy);
            if (currentAction == ACTION_WASHING && washing_time_counter > 0) {
                ctx.drawImage(imgInfoIcon, 60, 0, pw, ph, px, py, pw, ph);//cleanning...1
            } else {
                //ctx.clearRect(imgInfoIcon, px, py, pw, ph);
                ctx.drawImage(imgInfoIconBW, 60, 0, pw, ph, px, py, pw, ph);//cleanning...1
            }
            py += (ph + ipy);

            if (SPEED_FLOW_OUT_PIN == 1) {
                ctx.drawImage(imgInfoIcon, 0, 20, pw, ph, px, py, pw, ph);//water draining.....
            } else {
                //ctx.clearRect(imgInfoIcon, px, py, pw, ph);
                ctx.drawImage(imgInfoIconBW, 0, 20, pw, ph, px, py, pw, ph);//water draining.....
            }
            py += (ph + ipy);

            if (currentAction == ACTION_DRYING) {
                ctx.drawImage(imgInfoIcon, 20, 20, pw, ph, px, py, pw, ph);
            } else {
                //ctx.clearRect(imgInfoIcon, px, py, pw, ph);
                ctx.drawImage(imgInfoIconBW, 20, 20, pw, ph, px, py, pw, ph);
            }

            py += (ph + ipy);
            ctx.drawImage(imgInfoIcon, 40, 20, pw, ph, px, py, pw, ph);
            py += (ph + ipy);

            if (waiting > 0) {
                ctx.drawImage(imgInfoIcon, 60, 20, pw, ph, px, py, pw, ph);
            } else {
                //ctx.clearRect(imgInfoIcon, px, py, pw, ph);
                ctx.drawImage(imgInfoIconBW, 60, 20, pw, ph, px, py, pw, ph);
            }

            py += (ph + ipy);


        }, 400);


        setInterval(function () {
            ctx.textAlign = "Start";
            ctx.font = "12px BoonJot";
            ctx.clearRect(380 - 50, 350 - 20, 50, 20);
            //ctx.fillText("Load", 380 - 50, 350 - 10);
            //ctx.fillText("Drain", 380 - 50, 350);


            if (FlOW_IN_PIN == 1) {
                ctx.font = "12px BoonJot";
                if (bin) {
                    bin = false;
                    ctx.clearRect(380 - 50, 350 - 20, 50, 12);
                    ctx.fillText("Load", 380 - 30, 350 - 10);
                } else {
                    ctx.clearRect(380 - 50, 350 - 20, 50, 12);
                    bin = true;
                }
            } else {

            }
            if (SPEED_FLOW_OUT_PIN == 1) {
                ctx.font = "12px BoonJot";
                if (bin) {
                    bin = false;
                    ctx.clearRect(380 - 50, 350 - 10, 50, 12);
                    ctx.fillText("Drain", 380 - 30, 350);
                } else {
                    ctx.clearRect(380 - 50, 350 - 10, 50, 12);
                    bin = true;
                }
            } else {
            }
        }, 500);
    };
    img.onload = function () {
        ctx.drawImage(img, (380 - 220) / 2, (350 - 227) / 2, 220, 227);
        //drawWaterLevelGuage(water_level);
    };
    water_raw = 65536;
    // water_level=50;

    function drawRawWaterLevel() {
        var scx = 340;
        ctx.lineWidth = .8;
        ctx.strokeStyle = "#FFFFFF";
        ctx.Style = "#FFFFFF";
        ctx.textAlign = "right";
        ctx.font = "12px BoonJot";
        ctx.clearRect(380 - 150, 0, 200, 19);
        ctx.fillText("RAW" + water_raw + "", 380 - 55, 10);
        ctx.fillText("(" + water_level + "%)", 380 - 10, 10);
        console.log(water_raw)
    }

    function drawWaterLevelGuage() {

        var scx = 340;
        ctx.lineWidth = .8;
        ctx.strokeStyle = "#FFFFFF";
        ctx.Style = "#FFFFFF";
        ctx.clearRect(scx - 1, 20 - 1, 40, 310);
        ctx.strokeStyle = "#A0A0A0";
        ctx.beginPath();
        // Staring point (10,45)
        ctx.moveTo(scx, 20);
        // End point (180,47)
        ctx.lineTo(scx, 320);
        ctx.textAlign = "start";
        ctx.font = "10px BoonJot";
        for (i = 0, j = 20; i <= 100; i++, j += (320 - 20) / 100) {
            ctx.moveTo(scx, j);
            if (i % 10 == 0) {
                ctx.lineTo(scx + 20, j);
                if (100 - i == 0)
                    continue;
                if (100 - i < 100) {
                    ctx.fillText("" + 100 - i + "%", scx + 18, j + 10);
                } else
                    ctx.fillText("" + 100 - i + "%", scx + 12, j + 10);
            } else if (i % 5 == 0) {
                ctx.lineTo(scx + 15, j);
            } else {
                ctx.lineTo(scx + 10, j);
            }
        }
        ctx.stroke();
        ctx.strokeStyle = "#00FF00";
        //ctx.lineWidth = .1;
        ctx.beginPath();
        ctx.textAlign = "start";
        ctx.font = "10px BoonJot";
        for (i = 0, j = 20; i <= 100; i++, j += (320 - 20) / 100) {

            if (100 - i == $('#endcounter_water_level').val()) {
                ctx.moveTo(scx, j);
                ctx.lineTo(scx - 5, j);
                break;
            }
        }

        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = "#0022FF";
        for (i = 0, j = 20; i <= 100; i++, j += (320 - 20) / 100) {
            if (water_level < 100 - i)
                continue;
            ctx.moveTo(scx, j);
            if (i % 10 == 0) {
                ctx.lineTo(scx + 20, j);
                if (100 - i == 0)
                    continue;
            } else if (i % 5 == 0) {
                ctx.lineTo(scx + 15, j);
            } else {
                ctx.lineTo(scx + 10, j);
            }
        }
        ctx.stroke();
        //ctx.strokeStyle = "#FF0000";
    }

    var speed = 0;
    img2.onload = function () {
        var ang = 0; //angle
        var fps = 1000 / 120; //number of frames per sec

        var cache = this; //cache the local copy of image element for future reference
        setInterval(function () {
            // if (current_direction != DIR_NONE) {
            ctx.save(); //saves the state of canvas
            ctx.translate((380 - 82) / 2 + 73, (350 - 82) / 2 + 39); //let's translate

            if (current_direction == DIR_CW) {
                speed = 5;
            } else if (current_direction == DIR_CCW) {
                speed = -5;
            } else if (current_direction == DIR_NONE) {
                speed = 0;
            }

            if (SPEED_FLOW_OUT_PIN == 1)
                speed = speed * 2;
            ctx.rotate(Math.PI / 180 * (ang += speed)); //increment the angle and rotate the image 
            ctx.drawImage(img2, -cache.width / 2, -cache.height / 2, cache.width, cache.height); //draw the image ;)
            ctx.restore(); //restore the state of canvas
            //  }

            drawWaterLevelGuage(water_level);
            drawRawWaterLevel(water_raw);


            ctx.strokeStyle = "#000000";
            ctx.Style = "#FFFFFF";
            ctx.textAlign = "center";
            ctx.font = "12px BoonJot";
            ctx.clearRect(380 - 182, 77, 43, 18);
            ctx.strokeRect((380 - 182) + 1, 77 + 1, 43 - 2, 18 - 2);
            // ctx.stroke();

            ctx.fillText(tTimes(waiting), (380 - 182) + (43 / 2), 77 + (18 - 5));


        }, fps);
    };
});
var port = 1988;
var sUrl;
//alert(window.location.host);
if (window.location.protocol === "https:") {
    sUrl = "wss:";
} else {
    sUrl = "ws:";
}
sUrl += "//" + window.location.host + ":" + port;
//sUrl += "//192.168.1.87:" + port;
var socket;
function connect() {
    socket = new WebSocket(sUrl);
    socket.onopen = function (event) {
        socket.send('I am the client and I\'m listening!\n');
        socket.onmessage = function (event) {
            if (event.data.startsWith("sts")) {
                //console.log('Client received a message', event);
                console.log(event.data);
                var infoArr = event.data.split(",");
                //console.log(infoArr.length);

                status = infoArr[0].split(':')[1];
                currentAction = infoArr[1].split(':')[1];
                washing_time_counter = infoArr[2].split(':')[1];
                washing_timer_buff = infoArr[3].split(':')[1];
                waiting = infoArr[4].split(':')[1];
                water_level = infoArr[5].split(':')[1];
                water_raw = infoArr[6].split(':')[1];
                current_direction = infoArr[7].split(':')[1];
                FlOW_IN_PIN = infoArr[8].split(':')[1];
                SPEED_FLOW_OUT_PIN = infoArr[9].split(':')[1];
                runtime = infoArr[10].split(':')[1];
                totalTime = infoArr[11].split(':')[1];
                washing_auto=infoArr[12].split(':')[1];
                //console.log(tTimes(runtime)+"/"+tTimes(totalTime));
                ctx.clearRect(380 / 2 - 100, 300, 200, 50);
                ctx.textAlign = "center";
                ctx.font = "10px BoonJot";
                ctx.fillText("ระยะเวลาโดยประมาณ", 380 / 2, 350);
                ctx.font = "30px BoonJot";
                ctx.fillText(tTimes(runtime) + "/" + tTimes(totalTime - 15), 380 / 2, 350 - 20);
                if (status == RUN) {
                    hideRunbutton();
                } else if (status == IDLE) {
                    showRunbutton();
                }
            } else if (event.data.startsWith("success")) {
                alert("Success!");
            }
        }
    };
    socket.onerror = function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        socket.close();
    };
    socket.onclose = function (event) {
        //console.log('Client notified socket has closed', event);
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', event.reason);
        setTimeout(function () {
            connect();
        }, 1000);
    };
}


connect();
var tdw = document.getElementById("tdw");
var tdd = document.getElementById("tdd");
var tdst = document.getElementById("tdst");
function hideRunbutton() {
    tdw.style.display = "none"
    tdd.style.display = "none"
    tdst.style.display = "table-cell"
}
function showRunbutton() {
    tdw.style.display = "table-cell"
    tdd.style.display = "table-cell"
    tdst.style.display = "none";
}

function wash() {
    socket.send("wash");
}
function dry() {
    socket.send("dry");
}
function stop() {
    socket.send("stop");
}
function canvasClicked(cv) {

}

function txtChange(txt) {
    if ($('#washing_loop').val() === "")
        $('#washing_loop').val("0");
    if ($('#washing_timer').val() === "")
        $('#washing_timer').val("0");
    if ($('#washing_spinner_duration').val() === "")
        $('#washing_spinner_duration').val("0");
    if ($('#washing_spinner_freeze_duration').val() === "")
        $('#washing_spinner_freeze_duration').val("0");
    if ($('#drying_duration').val() === "")
        $('#drying_duration').val("0");
    if ($('#endcounter_water_level').val() === "")
        $('#endcounter_water_level').val("0");
    if ($('#water_flow_in_duration').val() === "")
        $('#water_flow_in_duration').val("0");
    if ($('#water_flow_out_duration').val() === "")
        $('#water_flow_out_duration').val("0");
    if ($('#washing_auto').val() === "")
        $('#washing_auto').val("0");
    var strParam = "prm," + //0
            $('#washing_loop').val() + "," + //1
            $('#washing_timer').val() + "," + //2
            $('#washing_spinner_duration').val() + "," + //3
            $('#washing_spinner_freeze_duration').val() + "," + //4
            $('#drying_duration').val() + "," + //5
            $('#endcounter_water_level').val() + "," + //6
            $('#water_flow_in_duration').val() + "," + //7
            $('#water_flow_out_duration').val()+","+ //8
            $('#washing_auto').val(); //9

    socket.send(strParam + '\n');
    console.log(strParam);
}
function spin(dir) {
    socket.send("spin=" + dir + '\n');
}
function water(dir) {
    if (FlOW_IN_PIN == 1 || SPEED_FLOW_OUT_PIN == 1) {
        socket.send("water=" + WTR_HOLD + '\n');
    } else {
        socket.send("water=" + dir + '\n');
    }
}
function AssignMinWater(){
    socket.send("emty");
    $('#myModal').hide();
}
function AssignMaxWater(){
    socket.send("full");
    $('#myModal').hide();
}

$('#myModal').click(function () {
    //$('#myModal').hide();
});

$('#calibrateButton').click(function () {
    $('#sminButton').html("Map<br>"+water_raw+"<br>as Emty");
    $('#smaxButton').html("Map<br>"+water_raw+"<br>as Full lvl");
    $('#myModal').show();
    /*
    if (confirm('ปรับเทียบระดับน้ำใหม่?')) {
        // Save it!
        socket.send("tune");
        console.log('ans yes');
    } else {
        // Do nothing!
        console.log('ans no');
    }*/
});
$('#specialCommandButton').click(function () {
    if ($('#specialCommand').is(":hidden")) {
        $('#specialCommand').show();
        $('#specialCommandButton').html('<font size=2>- แสดงให้น้อยลง</font>');
    } else {
        $('#specialCommandButton').html('<font size=2>+ ปุ่มคำสั่งพิเศษ(คลิก)</font>');
        $('#specialCommand').hide();
    }
});
$('#paramButton').click(function () {
    if ($('#pram').is(":hidden")) {
        $('#pram').show();
        $('#paramButton').html('<font size=2>- แสดงให้น้อยลง </font>');
    } else {
        $('#pram').hide();
        $('#paramButton').html('<font size=2>+ ปรับเปลี่ยนพารามิเตอร์ (คลิก)</font>');
    }
});