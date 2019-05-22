<?php

namespace App\Home;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    //
    protected $table = 'users';
    public function getRow()
    {
    	return $this->where('name','Clemens Yost')->get();

    }
}
