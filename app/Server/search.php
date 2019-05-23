<?php

namespace App\Server;

use Sunra\PhpSimple\HtmlDomParser;
use App\Model\books_link;
use App\Jobs\ProcessPodcast;
use App\Jobs\addCate;
use App\Model\book;
use App\Model\author;
use Illuminate\Support\Facades\DB;
use App\Model\article;
use App\Server\handle;

/**
 * Class search
 * @package App\Server
 * author lwz
 * time 2019/5/22
 */
class search extends base implements handle
{
    protected $baseUrl = 'http://www.xbiquge.la';
    protected $isFrom = [
        1 => 'www.xbiquge.la'
    ];
    protected $from=1;
    public $booksData= [];

    public function __construct()
    {
        parent::__construct();
    }
    public function getBooks()
    {
        $this->url=$this->baseUrl . '/xiaoshuodaquan';
        $this->requestType = 'getBooks';
        $this->sendRequest();
    }
    public function getBooksHandle()
    {
        $this->buildBookHtml();
        return $this->booksData;
    }

    public function buildBookHtml()
    {
        $dom = $this->buildDom($this->response->getBody());
        $data= [];
        foreach ($dom->find('.novellist ul') as $ul) {
            foreach ($ul->find('li>a') as $a) {
                $temp = [
                    'text' => $a->plaintext,
                    'href' => $a->href,
                    'isfrom' => $this->from,
                ];
                $data[]=$temp;
//                ProcessPodcast::dispatch($data)->onQueue('bqgcate');
            }
        }
        $this->booksData=$data;
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
        return ($this->url = $this->baseUrl . '/xiaoshuodaquan');
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
            $author = author::firstOrCreate(['name' => $author, 'book_id' => 0]);
            book::where('id', $this->data['book_id'])
                ->update(['cate' => $cate, 'author' => $author->id, 'desc' => $desc]);
        });
        foreach ($html->find('#list dd a') as $k=> $a) {
            $data=[
                'books_link_id'=>$this->data['book_id'],
                'cate'=>$a->plaintext,
                'href'=>$a->href,
                'sort'=>($k+1)
            ];
            addCate::dispatch($data)->onQueue('cate');
        }
        echo 'ok';
    }
    public function getBookContent($data)
    {
        $this->requestType = 'last';
        $this->url = $this->baseUrl.$data['href'];
        $this->data = $data;
        $this->sendRequest();
    }
    public function lastHandle()
    {
        $str = $this->response->getBody();

        $html = HtmlDomParser::str_get_html($str);
        $text=$html->find('#content',0)->plaintext;
        article::updateOrCreate(['article_cate_id'=>$this->data['article_cate_id']],['content'=>$text]);
        echo 'ok';
    }

    public function getChapter()
    {
        // TODO: Implement getChapter() method.
    }

    public function getContent()
    {
        // TODO: Implement getContent() method.
    }
}