<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" type="image/png" href="img/netpielogo.png"/>
        <title>{_apName}</title>
        <link rel="stylesheet" type="text/css" href='css/mystyle.css'>
        <script src="js/jquery-3.2.1.min.js" type="text/javascript"></script>
    </head>
    <body class='my-container'>
        <img src="img/background.svg">
        <div style='text-align:left;display:inline-block;min-width:260px;' >
            <div>
                <table align=center width=100%>
                    <tr>
                        <td align=center><font size="5">เครื่องซักผ้า</font><br>
                            <font color=#ff0000 size="6">{devname}</font><br>
                            <a id='paramButton' style='cursor:pointer;'><font size=2>+ ปรับเปลี่ยนพารามิเตอร์ (คลิก)</font></a>
                        </td>
                    </tr>
                    <tr>
                        <td align=center>
                            <div id='pram' style='display:none;' >
                                <table>
                                    <tr>
                                        <td>เริ่มซักอัตโนมัติโดยไม่ต้องกดเริ่ม</td>
                                        <td><input style="text-align:center; width:60px;" id='washing_auto' type='number' value='{washing_auto}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>วินาที</td></td>
                                    </tr>
                                    <tr>
                                        <td>รอบการซัก(ไม่รวมปั่นหมาด)</td>
                                        <td><input style="text-align:center; width:60px;" id='washing_loop' type='number' value='{washing_loop}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>ครั้ง</td></td>
                                    </tr>
                                    <tr>
                                        <td>ระยะเวลาซักต่อรอบ</td>
                                        <td><input style="text-align:center; width:60px;" id='washing_timer' type='number' value='{washing_timer}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>วินาที</td></td>
                                    </tr>
                                    <tr>
                                        <td>ระยะเวลาหมุนสปินเนอร์</td>
                                        <td><input style="text-align:center; width:60px;" id='washing_spinner_duration' type='number' value='{washing_spinner_duration}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>มิลลิวินาที</td></td>
                                    </tr>
                                    <tr>
                                        <td>ระยะพักสปินเนอร์</td>
                                        <td><input style="text-align:center; width:60px;" id='washing_spinner_freeze_duration' type='number' value='{washing_spinner_freeze_duration}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>มิลลิวินาที</td></td>
                                    </tr>
                                    <tr>
                                        <td>ระยะเวลาปั่นหมาด</td>
                                        <td><input style="text-align:center; width:60px;" id='drying_duration' type='number' value='{drying_duration}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>วินาที</td></td>
                                    </tr>
                                    <tr>
                                        <td>ระดับน้ำในถังซักที่ใช้ซักผ้า</td>
                                        <td><input style="text-align:center; width:60px;" id='endcounter_water_level' type='number' value='{endcounter_water_level}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>%</td></td>
                                    </tr>
                                    <tr>
                                        <td>เวลาพักคอยเมื่อระดับน้ำในถังพร้อม</td>
                                        <td><input style="text-align:center; width:60px;" id='water_flow_in_duration' type='number' value='{water_flow_in_duration}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>วินาที</td></td>
                                    </tr>
                                    <tr>
                                        <td>เวลาพักคอยเมื่อระดับน้ำในถังแห้ง</td>
                                        <td><input style="text-align:center; width:60px;" id='water_flow_out_duration' type='number' value='{water_flow_out_duration}' onchange="txtChange(this)" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"><td>วินาที</td></td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
                <table align=center width=100%>
                    <tr align='center'>
                        <td ><canvas style="background:#FFFFFF; width:380px;height:350px;" width="380" height="350" cursta="1" totalstate="3" id='cv' onclick='canvasClick(this)'></canvas></td>
                    </tr>
                </table>
            </div>

            <!-- The Modal -->
            <div id="myModal" class="modal" widht="500">

                <!-- Modal content -->
                <div class="modal-content">
                    <center>
                        <span class="close">&times;</span>
                        <p>ตัวเลือกการคาลิเบลทเซ็นเซอร์วัดระดับน้ำ</p>

                        <button class='button' id="sminButton" style="width:150px;" onclick="AssignMinWater()">Map as *Min* Level</button><br><br>
                        <button class='button' id="smaxButton" style="width:150px;" onclick="AssignMinWater()">Map as *Max* Level</button>
                    </center>
                </div>

            </div>

            <table width=100% align='center'><tr><td align=center><hr></td></tr></table>
            <table align='center' width=100%>
                <tr><td colspan=2 align=center id='specialCommandButton'><font size=2>+ ปุ่มคำสั่งพิเศษ(คลิก)</font><br></td></tr>
                <tr>
                    <td align=center colspan=2>
                        <div id='specialCommand' style='display:none;' >
                            <button class='button' onclick="water(WTR_LOAD)">ทางน้ำเข้า</button>
                            <button class='button' onclick="water(WTR_DRAIN)">ทางน้ำออก</button>
                            <button class='button' id="calibrateButton">คาลิเบ..<br>เซ็นเซอร์</button>
                            <button class='button' onclick="spin(DIR_CW)">Spinner<br>(CW)</button>
                            <button class='button' onclick="spin(DIR_CCW)">Spinner<br>(CCW)</button>
                            <button class='button' onclick="alert('!!กำลังพัฒนา...!!')">Spinner<br>(LOOP)</button>
                        </div>	
                    </td>
                <tr>
                    <td align=right id="tdw"><button id="btn_wash" onclick="wash()" class='button'>ซักผ้า</button></td>
                    <td id="tdd"><button id="btn_dry" onclick="dry()" class='button'>ปั่นแห้ง</button></td>
                    <td align=center id="tdst" style="display:none;"><button id="btn_stop" onclick="stop()" class='button'>หยุด</button></td>
                </tr>
            </table>
            <?php include('footer.php'); ?>
        </div>
        <div class='btnon' style='width:1px;height:1px;'></div>
        <script src="js/customscript.js" type="text/javascript"></script>
        <script>

                        var span = document.getElementsByClassName("close")[0];
                        span.onclick = function () {
                            $('#myModal').hide();
                        }

        </script>
    </body>
</html>
