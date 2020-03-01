<?php


namespace App\Server;


use App\Server\Test\Test;

class Test2
{

    public function check()
    {
        (new Test())->get();
    }
}
