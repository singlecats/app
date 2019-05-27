<?php

namespace App\Http\Controllers\Home;

use App\Home\User;
use App\Http\Controllers\Controller;
use App\Jobs\addBookBase;
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
    }
    public function getContent(Request $request)
    {

        $from =$request->get('from');
//        $id = 1;
//        $book = $request->get('linkId');
        $booksLinkId = $request->get('linkId');
        $chapter = $request->get('chapter');
        $search = new search();
        $manage = new manage($search);
        $ret = $manage->handle->getContentCache($from, $chapter, $booksLinkId);
        echo $ret['content'];
//        $ret = $manage->handle->getContent($from, $book, $id);
//        echo ($manage->handle->content['content']);
    }
}
