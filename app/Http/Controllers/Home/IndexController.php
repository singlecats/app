<?php

namespace App\Http\Controllers\Home;

use App\Home\User;
use App\Http\Controllers\Controller;
use App\Jobs\addBookBase;
use App\Server\data;
use App\Server\goodServer;
use App\Server\httpServer;
use Illuminate\Http\Request;
use App\Server\search;
use App\Server\manage;
use Illuminate\Support\Facades\Session;

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
        echo 1111;
        echo 22;
        echo 'ok';
    }

    public function getChapter(Request $request)
    {
        $search = new search();
        $manage = new manage($search);
        $from = $request->get('from',1);;
        $bookId = $request->get('bookId',0);;
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
    }

    public function getAllChapter(Request $request)
    {
        $from = $request->get('from');
        $booksLinkId = $request->get('linkId');
        $data = new data();
        $ret = $data->getAllChapter($from, $booksLinkId, ['sort', 'desc']);
        dd($ret);
    }
    public function getNewChapter(Request $request)
    {
        $booksId = $request->get('bookId');
        $handle = new search();
        $handle->updateNewChapter($booksId);
    }

    public function getLoginQrCode()
    {
        $http = new httpServer();
//        echo $http->getStorageCookie();
        $qrCode = $http->getQrcode();
        return view('login.login', ['code' => $qrCode, 'token' => Session::get('wlfstk_smdl')]);
    }

    public function checkQrcode(Request $request)
    {
        $http = new httpServer();
        return $http->checkQrCode($request->token);
    }

    public function checkTicket(Request $request)
    {
        $http = new httpServer();
        return $http->checkTicket($request->ticket, $request->callback);
    }

    public function getUser()
    {
//        $http = new httpServer();
//        $ret = $http->getList();
//        print_r($ret);die;
        $http = new goodServer();
        echo $http->checkTime();
    }
}
