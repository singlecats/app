<!DOCTYPE html>
<html lang="en">
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<head>
    <meta charset="UTF-8">
    <title>buy</title>
</head>
<body>
</body>
@verbatim
    <script !src="">
        var ws = new WebSocket("ws://http://www.blog.hd:8083/msg");
        //readyState属性返回实例对象的当前状态，共有四种。
        //CONNECTING：值为0，表示正在连接。
        //OPEN：值为1，表示连接成功，可以通信了。
        //CLOSING：值为2，表示连接正在关闭。
        //CLOSED：值为3，表示连接已经关闭，或者打开连接失败
        //例如：if (ws.readyState == WebSocket.CONNECTING) { }

        //【用于指定连接成功后的回调函数】
        ws.onopen = function (evt) {
            console.log("Connection open ...");
            ws.send("Hello WebSockets!");
        };
        //ws.addEventListener('open', function (event) {
        //    ws.send('Hello Server!');
        //};

        //【用于指定收到服务器数据后的回调函数】
        //【服务器数据有可能是文本，也有可能是二进制数据，需要判断】
        ws.onmessage = function (event) {
            if (typeof event.data === String) {
                console.log("Received data string");
            }

            if (event.data instanceof ArrayBuffer) {
                var buffer = event.data;
                console.log("Received arraybuffer");
            }
            console.log("Received Message: " + evt.data);
            ws.close();
        };

        //[【于指定连接关闭后的回调函数。】
        ws.onclose = function (evt) {
            console.log("Connection closed.");
        };
    </script>
@endverbatim
</html>
