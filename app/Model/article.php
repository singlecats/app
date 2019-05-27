<?php

namespace App\Model;

use App\Traits\tableExchange;
use Illuminate\Database\Eloquent\Model;

class article extends Model
{
    use tableExchange;
    protected $table = 'article';
    protected $guarded = [];
}
