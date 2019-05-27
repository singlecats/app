<?php

namespace App\Http\Controllers\Home;

use App\Home\User;
use App\Http\Controllers\Controller;
use App\Jobs\addBookBase;
use App\Server\data;
use Illuminate\Http\Request;
use App\Server\search;
use App\Server\manage;

class IndexController extends Controller
{
    //
    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function index(Request $request)
    {
        $search = new search();
        $manage = new manage($search);
        $manage->handle->getBooks();
        $manage->addBooksBase();
        echo 'ok';
    }

    public function getChapter()
    {
        $search = new search();
        $manage = new manage($search);
        $from = 0;
        $bookId = 0;
        $manage->handle->getChapter($from, $bookId);
        echo 'ok';
    }

    public function getContent(Request $request)
    {
        $from = $request->get('from');
        $booksLinkId = $request->get('linkId');
        $chapter = $request->get('chapter');
        $search = new search();
        $manage = new manage($search);
        $ret = $manage->handle->getContentCache($from, $booksLinkId, $chapter);
        return $ret;
    }

    public function getAllChapter(Request $request)
    {
        $from = $request->get('from');
        $booksLinkId = $request->get('linkId');
        $data = new data();
        $ret = $data->getAllChapter($from, $booksLinkId, ['sort', 'desc']);
        dd($ret);
    }
}
