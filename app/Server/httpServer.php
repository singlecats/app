<?php


namespace App\Server;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;

class httpServer
{
    private $defaultHeader = [
        ':authority' => 'qr.m.jd.com',
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        'referer' => 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F',
    ];
    public function getQrcode()
    {
        $client = new Client(['cookies' => true]);
        $timeStamp = $this->msectime();
        $res = $client->request('GET', 'https://qr.m.jd.com/show?appid=133&size=147&t=' . $timeStamp, [
            'headers' => [
                ':authority' => 'qr.m.jd.com',
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
                'referer' => 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F'
            ]
        ]);
        $newCookies = $res->getHeader('set-cookie');
        $arrQrcodeKey = explode(';', $newCookies[0]);
        $qrcodeKey = str_replace('QRCodeKey=', '', $arrQrcodeKey[0]);
        $arrToken = explode(';', $newCookies[1]);
        Session::put('wlfstk_smdl', str_replace('wlfstk_smdl=', '', $arrToken[0]));
        Session::put('QRCodeKey', $qrcodeKey);
        $img = ($res->getBody()->getContents());
        Storage::put('login/login.png', $img);
        Storage::disk('public')->put('login/login.png', $img);
        return Storage::url('login/login.png');
    }

    public function msectime()
    {
        $times = explode(' ', microtime());
        $msectime = (float)sprintf('%.0f', (floatval($times[0]) + floatval($times[1])) * 1000);
        return $msectime;
    }

    public function checkQrCode()
    {
        $token = Session::get('wlfstk_smdl');
        $timeStamp = $this->msectime();
        $key = Session::get('QRCodeKey');
        $params = http_build_query(['appid' => 133, 'token' => $token, '_' => $timeStamp, 'callback' => 'jQueryCallback']);
        $client = new Client(['cookies' => true]);
        $res = $client->request('GET', 'https://qr.m.jd.com/check?' . $params, [
            'headers' => [
                ':authority' => 'qr.m.jd.com',
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
                'referer' => 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F',
                'cookie' => 'QRCodeKey=' . $key . '; wlfstk_smdl=' . $token
            ]
        ]);
        return $res->getBody()->getContents();
//        $ret = $this->getContent($res->getBody()->getContents());
//        return $ret['data'];
    }

    public function checkTicket($ticket, $callback)
    {
        $client = new Client(['cookies' => true]);
        $res = $client->request('GET', 'https://passport.jd.com/uc/qrCodeTicketValidation?callbackt=' . $ticket, [
            'headers' => [
                ':authority' => 'qr.m.jd.com',
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
                'referer' => 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F'
            ]
        ]);
        $newCookies = $res->getHeader('set-cookie');
        $cookie = $this->setStorageCookie($newCookies);
        return ['code' => 200, 'data' => ''];
    }

    public function setStorageCookie($newCookies)
    {
        $loginSuccessCookie = '';
        foreach ($newCookies as $item) {
            $arrCookie = explode(';', $item);
            $loginSuccessCookie .= $arrCookie[0] . ';';
            $arr = explode('=', $arrCookie[0]);
            Session::put('loginCookie' . $arr[0], $arr[1]);
        }
        trim($loginSuccessCookie, ';');
        Session::put('loginCookie', $loginSuccessCookie);
        return $loginSuccessCookie;
    }

    public function getStorageCookie()
    {
        return Session::get('loginCookie');
    }

    public function getStorageCookieByKey($key)
    {
        return Session::get('loginCookie'.$key);
    }

    public function getList()
    {
        $timeStamp = $this->msectime();
        $client = new Client(['cookies' => true]);
        $res = $client->request('GET', 'https://passport.jd.com/user/petName/getUserInfoForMiniJd.action?callback=jQueryCallback&_=' . $timeStamp, [
            'headers' => [
                ':authority' => 'qr.m.jd.com',
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
                'referer' => 'https://passport.jd.com/new/login.aspx?ReturnUrl=https%3A%2F%2Fwww.jd.com%2F',
                'Cookie' => $this->getStorageCookie(),
            ]
        ]);
        $ret = $this->getContent($res->getBody()->getContents());
        return $ret['data'];
    }



    public function get($url, $header = [])
    {
        $client = new Client();
        $header = array_merge($this->defaultHeader, $header);
        $header['Cookie'] = $header['Cookie']?? $this->getStorageCookie();
        $response = $client->request('GET', $url, [
            'headers' => $header,
        ]);
        $code = $response->getStatusCode(); // 200
        if ($code == 200) {
            return $this->getContent($response->getBody()->getContents());
        }
        return [];
    }

    public function getContent($text)
    {
        if (strpos($text, 'jQueryCallback') !== false) {
            $content = str_replace('jQueryCallback(', '', $text);
            $content = str_replace(')', '', $content);
            $content = trim($content, ';');
            return ['code' => 200, 'data' => json_decode($content, true)];
        }
        return ['code' => 100, 'data' => $text];
    }

    public function post($url, $data, $header = [])
    {
//        $header = array_merge($this->defaultHeader, $header);
//        $header['Cookie'] = $header['Cookie']?? $this->getStorageCookie();
        $client = new Client();
        $response = $client->request('POST', $url, [
            'headers' => $header,
            'form_params' => $data,
        ]);
        try {
            $code = $response->getStatusCode(); // 200
            if ($code == 200) {
                return $this->getContent($response->getBody()->getContents());
            }
            return [];
        } catch (\HttpRequestException $e) {
            return [$e->getMessage()];
        }
    }
}
