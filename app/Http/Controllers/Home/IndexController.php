<?php

namespace App\Http\Controllers\Home;

use App\Home\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Jobs\ProcessPodcast;
use App\Server\search;

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
        $search =new search();
        $search->getWebCate();
    }
}
