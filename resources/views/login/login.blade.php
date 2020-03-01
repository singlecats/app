<!DOCTYPE html>
<html lang="en">
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<head>
    <meta charset="UTF-8">
    <title>login</title>
</head>
<body>
<img id="login-qrcode" src="{{$code}}" width="147px" height="147px" alt="">
</body>
<script !src="">
    var token = "{!! $token !!}";
</script>
@verbatim
    <script>
        function getTimeStamp() {
            return new Date().getTime();
        }

        function checkTicket(ticket) {
            $.ajax({
                type: "get",
                async: false,
                url: "http://www.blog.hd/login/checkTicket?callback=checkTicketCallback&ticket=" + ticket,
                callback: 'checkTicketCallback',
                dataType: "jsonp",//数据类型为json
                success: function (data) {

                },
                error: function () {
                    console.log('fail');
                }
            });
        }

        function checkTicketCallback(data) {
            console.log(data);
        }
        function jQueryCallback(data) {
            if (data.code === 200) {
                checkTicket(data.ticket);
            }
        }

        function check() {
            $.ajax({
                type: "get",
                async: false,
                url: "http://www.blog.hd/login/check",
                dataType: "jsonp",//数据类型为jsonp
                success: function (data) {
                    // if (data.code == 200) {
                    //     checkTicket(data.ticket);
                    // }
                },
                error: function () {
                    console.log('fail');
                }
            });
        }

        var checkInterval = setInterval(check, 5000);
    </script>
@endverbatim
</html>
