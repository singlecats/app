<?php

namespace App\Server;

use Sunra\PhpSimple\HtmlDomParser;

class base
{
    public $response = null;
    protected $isFrom = [
        1 => 'www.xbiquge.la'
    ];

    public function __construct()
    {
        defined('MAX_FILE_SIZE') || define('MAX_FILE_SIZE', 6000000);
    }

    public function sendRequest($method = 'GET', $func= [])
    {
        $client = new \GuzzleHttp\Client();
        $request = new \GuzzleHttp\Psr7\Request($method, $this->url);
        $temp = $this;
        $promise = $client->sendAsync($request)->then(function ($response) use ($temp, $func) {
            $temp->response = $response;
            $func[0]->{$func[1]}();
        });
        $promise->wait();
    }

    public function buildDom($str)
    {

        return HtmlDomParser::str_get_html($str);
    }
}
