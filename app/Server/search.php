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
        $html = HtmlDomParser::str_get_html($this->response->getBody());
        foreach ($html->find('.novellist ul') as $ul) {
            foreach ($ul->find('li') as $li) {
                echo $li;
//                die;
            }
        }
//        var_dump($html);
    }
}