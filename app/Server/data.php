<?php


namespace App\Server;


use App\Model\article;
use App\Model\author;
use App\Model\book;
use App\Model\books_link;
use App\Model\category;
use App\Model\chapter;
use Illuminate\Support\Facades\DB;
use mysql_xdevapi\Exception;

class data
{
    public function addBook(&$data)
    {
        DB::beginTransaction();
        try {
            $oBook = book::firstOrCreate(
                [
                    'name' => $data['text'],
                ]
            );
            $data['books_id'] = $oBook->id;
            $oLink = books_link::firstOrCreate(
                [
                    'books_id' => $oBook->id,
                    'from' => $data['isfrom']
                ],
                [
                    'link' => $data['href']
                ]
            );
            $data['books_link_id'] = $oLink->id;
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throwException('事务提交失败');
        }
    }

    public function addAuthor($name)
    {
        $oAuthor = author::firstOrCreate([
            'name' => $name
        ]);
        return $oAuthor->id;
    }

    public function setBook($bookId, $data)
    {
        book::where('id', $bookId)
            ->update($data);
    }

    public function setCate($data, $id = 0)
    {
        if (!empty($id)) {
            $cate = category::firstOrUpdate([
                'id' => $id
            ], $data);
            return $cate->id;
        }
        $cate = category::firstOrCreate($data);
        return $cate->id;
    }

    public function addChapter($data, $suffix = '_1')
    {
        chapter::suffix($suffix);
        $ret = chapter::updateOrCreate($data);
        return $ret->id;
    }

    public function getBookChapter($from, $booksLinkId, $chapter)
    {
        $condition = [];
        if (!empty($from)) {
            chapter::suffix('_' . $from);
        }
        if (!empty($booksLinkId)) {
            $condition[] = ['books_link_id', '=', $booksLinkId];
        }
        if (!empty($chapter)) {
            $condition[] = ['id', '=', $chapter];
        }
        $ret = chapter::where($condition)->select('id', 'books_id', 'books_link_id', 'chapter_index', 'name', 'link')->first();
        if (!empty($ret)) {
            $ret = $ret->toArray();
        }
        return $ret;
    }

    public function setContent($data, $from, $id)
    {
        article::suffix($from);
        $oArticle = article::updateOrCreate([
            'chapter_id' => $data['chapter_id'],
            'books_link_id' => $data['books_link_id']
        ], [
            'content' => $data['content']
        ]);
        return ['id' => $oArticle->id, 'content' => $data['content']];
    }

    public function getContentCache($from, $chapter, $booksLinkId)
    {
        article::suffix($from);
        $ret = article::where([
            'chapter_id' => $chapter,
            'books_link_id' => $booksLinkId
        ])->select('id', 'content')->first();
        return $ret;
    }

    public function getAllChapter($from, $link, $order)
    {
        chapter::suffix('_' . $from);
        $orderStr = implode(" ", $order);
        $ret = [];
        chapter::where('books_link_id', $link)
            ->select(['id', 'books_id', 'books_link_id', 'chapter_index', 'name', 'link'])
            ->orderByRaw($orderStr)
            ->chunk(100, function ($chapter) use (&$ret, $from) {
                foreach ($chapter as $k => $v) {
                    $v->from = $from;
                    $ret[] = $v->toArray();
                }
            });
        return $ret;
    }
}