<?php

namespace App\Model;

use Illuminate\Database\Eloquent\Model;
use App\Traits\tableExchange;

class chapter extends Model
{
    use tableExchange;
    protected $table = 'chapter';
    protected $guarded = [];
    //
}
