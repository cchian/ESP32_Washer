<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" type="image/png" href="img/netpielogo.png"/>
        <title>{_apName}</title>
        <link rel="stylesheet" type="text/css" href='css/mystyle.css'>
        <script src='js/jquery-3.2.1.min.js'></script>
    </head>
    <body class='my-container'>
        <img src="img/background.svg">
        <div style='text-align:left;display:inline-block;min-width:260px;' >
            <div>
                <table align=center width=100%>
                    <tr>
                        <td align=center colspan="2"><font size="5">เครื่องซักผ้า</font><br>
                            <font color=#ff0000 size="6">{devname}</font><br>
                        </td>
                    </tr>
                    <tr >
                        <td align=center>
                            <input type="text" id="txtInput" width="100%"/>
                        </td>
                        <td align=center><button class='button' onclick="water(WTR_LOAD)">Send</button>
                            </td>
                    </tr>
                </table>
                <table align=center width=100%>
                    <tr align='center'>
                        <td>
                            <textarea id="txtTerminal"  rows="20" cols="50">
The quic brown fog jump over the lazy dogs.
_____________________________
>></textarea>
                        </td>
                    </tr>
                </table>
            </div>
            <table width=100% align='center'>
                <tr>
                    <td align=center><button class='button' onclick="water(WTR_LOAD)">Clear</button></td>
                    <td align=center><button class='button' onclick="water(WTR_LOAD)">Refresh</button></td>
                    <td align=center><button class='button' onclick="water(WTR_LOAD)">Refresh</button></td>
                </tr>
            
            </table>

            <?php include('footer.php'); ?>
        </div>
        <div class='btnon' style='width:1px;height:1px;'></div>
        <!--script src='js/customscript.js'></script-->
        <script>

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
                        $('#txtTerminal').append(event.data);
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
        </script>
    </body>
</html>
