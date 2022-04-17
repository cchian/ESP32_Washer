<html>
    <head>
        <title>FW Updater</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
            
            #file-input,input{
                width:100%;
                height:44px;
                border-radius:4px;
                margin:10px auto;
                font-size:15px
            }
            input{
                background:#f1f1f1;
                border:0;
                padding:0 15px
            }
            body{
                background:rgb(230,255,230);
                font-family:sans-serif;
                font-size:14px;
                color:#777
            }
            #file-input{
                padding:0;
                border:1px solid #ddd;
                line-height:44px;
                text-align:left;
                display:block;
                cursor:pointer
            }
            #bar,#prgbar{
                background-color:#f1f1f1;
                border-radius:10px
            }
            #bar{
                background-color:#3498db;
                width:0%;height:10px
            }
            form{
                background:#fff;
                max-width:258px;
                margin:75px auto;
                padding:30px;
                border-radius:5px;
                text-align:center
            }
            .btn{
                background:#3498db;
                color:#fff;
                cursor:pointer
            }
        </style>
        <script src="js/jquery-3.2.1.min.js" type="text/javascript"></script>
    </head>
    <body>
        <div id="dropContainer"><pre>
            หลังจากอัพเดทเฟิร์มแวร์แล้วจะไม่สามารถคืนค่าโปรแกรมให้กลับมาเหมือนเดิมได้ 
            หากเกิดความผิดพลาดในเรื่องของการนำโปรแกรมอื่นๆนอกเหนือจากโปรแกรมที่เข้ากันได้กับอุปกรณ์นี้จะไม่สามรถอัพเดทเฟิร์มแวร์ผ่านช่องทางนี้ได้อีก!
            โปรดแน่ใจว่าเฟิร์มแวร์ที่จะทำการอัพเดทนั้นเข้ากันได้กับอุปกรณ์นี้</pre>
            <form method='POST' action='#' enctype='multipart/form-data' id='upload_form'>
                <input type='file' name='update' id="fileInput">
                <input type='submit' value='Update'>
            </form>
            <div id='pg' style='display:none;' align="center">
                <label for='file'>Update Progress: </label>
                <progress id='prg' value='0' max='100'></progress><label id='pglbl'>0%</label>
            </div>
        </div>
        <script>
            // dragover and dragenter events need to have 'preventDefault' called
// in order for the 'drop' event to register. 
// See: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_operations#droptargets
            dropContainer.ondragover = dropContainer.ondragenter = function (evt) {
                evt.preventDefault();
            };
            dropContainer.ondrop = function (evt) {
                // pretty simple -- but not for IE :(
                fileInput.files = evt.dataTransfer.files;
                // If you want to use some of the dropped files
                const dT = new DataTransfer();
                dT.items.add(evt.dataTransfer.files[0]);
                //dT.items.add(evt.dataTransfer.files[3]);
                fileInput.files = dT.files;

                evt.preventDefault();
                $('form').submit();
            };

            $('form').submit(function (e) {
                e.preventDefault();
                var form = $('#upload_form')[0];
                var data = new FormData(form);
                $.ajax({
                    url: '/update',
                    type: 'POST',
                    data: data,
                    contentType: false,
                    processData: false,
                    xhr: function () {
                        var xhr = new window.XMLHttpRequest();
                        $('#pg').show();
                        xhr.upload.addEventListener('progress', function (evt) {
                            if (evt.lengthComputable) {
                                var per = evt.loaded / evt.total;
                                $('#pglbl').html(' ' + Math.round(per * 100) + '%');
                                $('#prg').val(Math.round(per * 100));
                            }
                        }, false);
                        return xhr;
                    },
                    success: function (d, s) {
                        alert("Succesfull!")
                        document.location="/";
                    },
                    error: function (a, b, c) {
                    }
                });
            });
        </script>
    </body>
</html>