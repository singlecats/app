<?php

namespace App\Server;

use Sunra\PhpSimple\HtmlDomParser;

class base
{
    public $response = null;
    public function __construct()
    {
        $this->client = new \GuzzleHttp\Client();
    }

    public function sendRequest($method = 'GET')
    {
        $request = new \GuzzleHttp\Psr7\Request($method, $this->url);
        $temp = $this;
        $promise = $this->client->sendAsync($request)->then(function ($response) use ($temp) {
            $temp->response = $response;
            $temp->handle();
        });
        $promise->wait();
    }

    public function handle()
    {
        $this->{$this->requestType . 'handle'}();
    }
    public function buildDom($str)
    {
        return HtmlDomParser::str_get_html($str);
    }
}
