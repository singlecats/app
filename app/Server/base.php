<?php

namespace App\Server;

class base
{
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
}
