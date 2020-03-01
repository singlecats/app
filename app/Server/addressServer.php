<?php


namespace App\Server;


class addressServer
{

    protected $httpServe = null;

    public function __construct()
    {
        $this->httpServe = new httpServer();
    }

    public function msectime()
    {
        $times = explode(' ', microtime());
        $msectime = (float)sprintf('%.0f', (floatval($times[0]) + floatval($times[1])) * 1000);
        return $msectime;
    }

    public function getAddressLists()
    {
        $url = 'https://cd.jd.com/usual/address?&callback=jQuery8575179&_='.$this->msectime();
        $ret = $this->httpServe->get($url);
        return $ret['data'];
    }
}
