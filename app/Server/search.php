<?php

namespace App\Server;
use Sunra\PhpSimple\HtmlDomParser;
use App\Model\book;
/**
 * Class search
 * @package App\Server
 * author lwz
 * time 2019/5/22
 */
class search extends base
{
    protected $baseUrl = 'http://www.xbiquge.la/';

    public function __construct()
    {
        $this->client = new \GuzzleHttp\Client();
        $this->dom= new HtmlDomParser();
    }

    public function getWebCate()
    {
        $url = $this->getWebCateUrl();
        $this->sendRequest();

    }

    public function getWebPage()
    {

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
    public function getWebCateUrl()
    {
        $this->requestType='cate';
        return ($this->url=$this->baseUrl . 'xiaoshuodaquan');
    }

    public function handle()
    {
        $this->{$this->requestType.'handle'}();
    }
    public function cateHandle()
    {
//        echo $this->response->getBody();
//        die;
        $html=HtmlDomParser::str_get_html($this->response->getBody());
        foreach ($html->find('.novellist ul') as $ul){
            foreach ($ul->find('li') as $li){
                echo $li;
//                die;
            }
        }
//        var_dump($html);
    }
}