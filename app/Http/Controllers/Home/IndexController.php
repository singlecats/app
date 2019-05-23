<?php

namespace App\Http\Controllers\Home;

use App\Home\User;
use App\Http\Controllers\Controller;
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
        print_r($manage->handle->booksData);
    }
}
