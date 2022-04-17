<!DOCTYPE html>
<html lang="en">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>info</title>
        <link rel="shortcut icon" type="image/png" href="img/netpielogo.png">
        <link rel="stylesheet" type="text/css" href='css/mystyle.css'>
    </head>
    <body>
        <div class='page'>
            <div id=content>

            </div>
            <? include('footer.php');?>
        </div>

        <script>
            String.prototype.replaceAll = function (search, replacement) {
                var target = this;
                return target.split(search).join(replacement);
            };
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
                    if (xmlhttp.status == 200) {
                        var content = document.getElementById('content');
                        var con = xmlhttp.responseText;
                        con = con.replaceAll("{apName}", xmlhttp.getAllResponseHeaders().split("\n")[1].split(":")[1].trim());
                        content.innerHTML = con;
                    } else if (xmlhttp.status == 400) {
                        //alert('There was an error 400');
                    } else {
                        // alert('something else other than 200 was returned');
                    }
                }
            };
            xmlhttp.open("GET", "i?data=ct", true);
            xmlhttp.send();
        </script>
    </body>
</html>