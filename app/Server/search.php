<?php

namespace App\Server;

use Sunra\PhpSimple\HtmlDomParser;
use App\Model\books_link;
use App\Jobs\ProcessPodcast;

/**
 * Class search
 * @package App\Server
 * author lwz
 * time 2019/5/22
 */
class search extends base
{
    protected $baseUrl = 'http://www.xbiquge.la/';
    protected $isFrom=[
        1=> 'www.xbiquge.la'
    ];

    public function __construct()
    {
        parent::__construct();
    }

    public function getWebCate()
    {
        $url = $this->getWebCateUrl();
        $this->sendRequest();
    }

    public function getWebPage()
    {

    }

    public function getWebCateUrl()
    {
        $this->requestType = 'cate';
        return ($this->url = $this->baseUrl . 'xiaoshuodaquan');
    }

    public function cateHandle()
    {
        $str =$this->response->getBody();
        $html = HtmlDomParser::str_get_html($str);
        foreach ($html->find('.novellist ul') as $ul) {
            foreach ($ul->find('li>a') as $a) {
                $data=[
                    'text'=>$a->plaintext,
                    'href'=>$a->href,
                    'isfrom'=>1
                ];
                ProcessPodcast::dispatch($data)->onQueue('bqgcate');
            }
        }
        echo 'ok';
//        var_dump($html);
    }
    public function updateBookLink()
    {
        books_link::chunk(200, function ($books) {
            foreach ($books as $book) {
                $this->pageUrl=$book->link;
            }
        });
    }
}