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
    protected $from = 1;
    public $booksData = [];

    public function __construct()
    {
        parent::__construct();
    }

    public function getBooks()
    {
        $this->url = $this->baseUrl . '/xiaoshuodaquan';
        $this->requestType = 'getBooks';
        $this->step = 1;
        $this->sendRequest();
    }

    public function handle()
    {
        if ($this->step == 1) {

            $this->buildBookHtml();
        } elseif ($this->step == 2) {
            $this->buildCapterHtml();
        } elseif ($this->step == 3) {
            $this->getContentHtml();
        }
    }

    public function buildBookHtml()
    {
        $dom = $this->buildDom($this->response->getBody());
        $data = [];
        foreach ($dom->find('.novellist ul') as $ul) {
            foreach ($ul->find('li>a') as $a) {
                $temp = [
                    'text' => $a->plaintext,
                    'href' => $a->href,
                    'isfrom' => $this->from,
                ];
                $data[] = $temp;
            }
        }
        $this->booksData = $data;
        $dom->clear();
    }

    /**
     * public function getWebCate()
     * {
     * $url = $this->getWebCateUrl();
     * $this->sendRequest();
     * }
     *
     * public function getWebPage()
     * {
     * $this->requestType = 'page';
     * }
     *
     * public function getWebCateUrl()
     * {
     * $this->requestType = 'cate';
     * return ($this->url = $this->baseUrl . '/xiaoshuodaquan');
     * }
     *
     * public function cateHandle()
     * {
     * $str = $this->response->getBody();
     * $html = HtmlDomParser::str_get_html($str);
     * foreach ($html->find('.novellist ul') as $ul) {
     * foreach ($ul->find('li>a') as $a) {
     * $data = [
     * 'text' => $a->plaintext,
     * 'href' => $a->href,
     * 'isfrom' => 1
     * ];
     * ProcessPodcast::dispatch($data)->onQueue('bqgcate');
     * }
     * }
     * echo 'ok';
     * //        var_dump($html);
     * }
     *
     * public function updateBookLink($data)
     * {
     * $this->getWebPage();
     * $this->url = $data['href'];
     * $this->data = $data;
     * $this->sendRequest();
     *
     * }
     *
     * public function pageHandle()
     * {
     * $str = $this->response->getBody();
     * $html = HtmlDomParser::str_get_html($str);
     * $author = $html->find('#maininfo p', 0)->plaintext;
     * preg_match('/：([\x{4e00}-\x{9fa5}]*\w*)/u', $author, $match);
     * $author = trim($match[1]);
     * $cate = $html->find('.con_top a', 2)->plaintext;
     * $desc = $html->find('#intro p', 1)->plaintext;
     * DB::transaction(function () use ($author, $cate, $desc) {
     * $author = author::firstOrCreate(['name' => $author, 'book_id' => 0]);
     * book::where('id', $this->data['book_id'])
     * ->update(['cate' => $cate, 'author' => $author->id, 'desc' => $desc]);
     * });
     * foreach ($html->find('#list dd a') as $k=> $a) {
     * $data=[
     * 'books_link_id'=>$this->data['book_id'],
     * 'cate'=>$a->plaintext,
     * 'href'=>$a->href,
     * 'sort'=>($k+1)
     * ];
     * addCate::dispatch($data)->onQueue('cate');
     * }
     * echo 'ok';
     * }
     * public function getBookContent($data)
     * {
     * $this->requestType = 'last';
     * $this->url = $this->baseUrl.$data['href'];
     * $this->data = $data;
     * $this->sendRequest();
     * }
     * public function lastHandle()
     * {
     * $str = $this->response->getBody();
     *
     * $html = HtmlDomParser::str_get_html($str);
     * $text=$html->find('#content',0)->plaintext;
     * article::updateOrCreate(['article_cate_id'=>$this->data['article_cate_id']],['content'=>$text]);
     * echo 'ok';
     * }
     **/
    public function getChapter($from = 0, $bookId = 0)
    {
        $condition = [];
        if (!empty($from)) {
            $condition[] = ['from', $from];
        }
        if (!empty($linkId)) {
            $condition[] = ['books_id', $bookId];
        }
        $temp = $this;
        books_link::where($condition)->chunk(200, function ($oBook) use ($temp) {
            foreach ($oBook as $v) {
                addCate::dispatch($temp, $v->toArray())->onQueue('chapter');
                die;
            }
        });
    }

    public function getChapterList($data)
    {
        $this->url = $data['link'];
        $this->chapterData = $data;
        $this->step = 2;
        $this->sendRequest();
    }

    public function buildCapterHtml()
    {
        $dom = $this->buildDom($this->response->getBody());
        $author = $dom->find('#maininfo p', 0)->plaintext;
        preg_match('/：([\x{4e00}-\x{9fa5}]*\w*)/u', $author, $match);
        $author = trim($match[1]);
        $cate = $dom->find('.con_top a', 2)->plaintext;
        $desc = $dom->find('#intro p', 1)->plaintext;
        $dataModel = new data();
        DB::transaction(function () use ($author, $desc, $cate, $dataModel) {
            $cateData = [
                'pid' => 0,
                'name' => str_replace('小说', '', $cate),
                'level' => 1
            ];
            $authorId = $dataModel->addAuthor($author);
            $cateId = $dataModel->setCate($cateData);
            $bookData = [
                'author' => $authorId,
                'category' => $cateId,
                'desc' => $desc
            ];
            $dataModel->setBook($this->chapterData['books_id'], $bookData);
        });
        DB::transaction(function () use ($dataModel, $dom) {
            foreach ($dom->find('#list dd a') as $k => $a) {
                $data = [
                    'books_id' => $this->chapterData['books_id'],
                    'books_link_id' => $this->chapterData['id'],
                    'chapter_index' => $k,
                    'name' => $a->plaintext,
                    'link' => $this->baseUrl . $a->href,
                    'sort' => $k
                ];
                $dataModel->addChapter($data);
            }
        });
        $dom->clear();
    }

    function getContent($from = 1, $booksLinkId = 0, $chapter = 0)
    {
        $data = new data();
        $ret = $data->getBookChapter($from, $booksLinkId, $chapter);
        $this->url = $ret['link'];
        $this->contentData = $ret;
        $this->contentData['from'] = $from;
        $this->step = 3;
        $this->sendRequest();
    }

    public function getContentHtml()
    {
        $dom = $this->buildDom($this->response->getBody());
        $dom->find('#content p', 0)->innertext = '';
        $text = $dom->find('#content', 0)->plaintext;
        $dom->clear();
        $data = new data();
        $dataArr = [
            'books_link_id' => $this->contentData['books_link_id'],
            'chapter_id' => $this->contentData['id'],
            'content' => $text
        ];
        $ret = $data->setContent($dataArr, '_' . $this->contentData['from'], $this->contentData['id']);
        $this->content = $ret;
    }

    public function getContentCache($from, $chapter, $booksLinkId)
    {
        $data = new data();
        $ret = $data->getContentCache('_' . $from, $chapter, $booksLinkId);
        dd($ret);
        die;
        if (empty($ret)) {
            $this->getContent($from, $booksLinkId, $chapter);
            $ret = $this->content;
        }
        return $ret;
    }
}