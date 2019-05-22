<?php

namespace App\Server;

use Sunra\PhpSimple\HtmlDomParser;
use App\Model\books_link;
use App\Jobs\ProcessPodcast;
use App\Model\book;
use App\Model\author;
use Illuminate\Support\Facades\DB;

/**
 * Class search
 * @package App\Server
 * author lwz
 * time 2019/5/22
 */
class search extends base
{
    protected $baseUrl = 'http://www.xbiquge.la/';
    protected $isFrom = [
        1 => 'www.xbiquge.la'
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
        $this->requestType = 'page';
    }

    public function getWebCateUrl()
    {
        $this->requestType = 'cate';
        return ($this->url = $this->baseUrl . 'xiaoshuodaquan');
    }

    public function cateHandle()
    {
        $str = $this->response->getBody();
        $html = HtmlDomParser::str_get_html($str);
        foreach ($html->find('.novellist ul') as $ul) {
            foreach ($ul->find('li>a') as $a) {
                $data = [
                    'text' => $a->plaintext,
                    'href' => $a->href,
                    'isfrom' => 1
                ];
                ProcessPodcast::dispatch($data)->onQueue('bqgcate');
//                die;
            }
        }
        echo 'ok';
//        var_dump($html);
    }

    public function updateBookLink($data)
    {
        $this->getWebPage();
        $this->url = $data['href'];
        $this->data = $data;
        $this->sendRequest();

    }

    public function pageHandle()
    {
        $str = $this->response->getBody();
        $html = HtmlDomParser::str_get_html($str);
        $author = $html->find('#maininfo p', 0)->plaintext;
        preg_match('/：([\x{4e00}-\x{9fa5}]*\w*)/u', $author, $match);
        $author = trim($match[1]);
        $cate = $html->find('.con_top a', 2)->plaintext;
        $desc = $html->find('#intro p', 1)->plaintext;
        DB::transaction(function () use ($author, $cate, $desc) {
            $author = author::firstOrCreate(['name' => $author, 'book_id' => $this->data['book_id']]);
            book::where('id', $this->data['book_id'])
                ->update(['cate' => $cate, 'author' => $author->id, 'desc' => $desc]);
        });

        echo 'ok';
    }
}