<?php

namespace App\Server;

use App\Model\books_link;
use App\Model\book;
use App\Jobs\ProcessPodcast;
use App\Jobs\addCate;

use Illuminate\Support\Facades\DB;

/**
 * Class search
 * @package App\Server
 * author lwz
 * time 2019/5/22
 */
class search extends base implements handle
{
    protected $baseUrl = 'http://www.xbiquge.la';

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

    public function getChapter($from = 0, $bookId = 0)
    {
        $condition = [];
        if (!empty($from)) {
            $condition[] = ['from', $from];
        }
        if (!empty($bookId)) {
            $condition[] = ['books_id', $bookId];
        }
        $bookArr = book::where('desc','=','')->pluck('id')->toArray();
        $temp = $this;
        $bookObj = books_link::where($condition);
        if (!empty($bookArr)) {
            $bookObj = $bookObj->whereIn('books_id',$bookArr);
        }
        $bookObj->chunk(200, function ($oBook) use ($temp) {
            foreach ($oBook as $v) {
                addCate::dispatch($temp, $v->toArray())->onQueue('chapter');
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
        $author = $dom->find('#maininfo', 0)->plaintext;
        preg_match('/：([\x{4e00}-\x{9fa5}]*\w*)/u', $author, $match);
        $author = trim($match[1]);
        $cate = $dom->find('.con_top a', 2)->plaintext;
        $desc = $dom->find('#intro p', 1)->plaintext;
        $dataArr = [];
        foreach ($dom->find('#list dd a') as $k => $a) {
            $data = [
                'books_id' => $this->chapterData['books_id'],
                'books_link_id' => $this->chapterData['id'],
                'chapter_index' => $k,
                'name' => $a->plaintext,
                'link' => $this->baseUrl . $a->href,
                'sort' => $k
            ];
            $dataArr[] = $data;
        }
        $dom->clear();
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
        DB::transaction(function () use ($dataModel, $dataArr) {
            foreach ($dataArr as $v) {
                $dataModel->addChapter($v);
            }
        });
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

    public function getContentCache($from, $booksLinkId, $chapter)
    {
        $data = new data();
        $ret = $data->getContentCache('_' . $from, $chapter, $booksLinkId);
        if (empty($ret)) {
            $this->getContent($from, $booksLinkId, $chapter);
            $ret = $this->content;
        }
        return $ret;
    }
}