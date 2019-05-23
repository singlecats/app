<?php


namespace App\Server;

use Illuminate\Support\Facades\DB;
use App\Model\book;
use App\Model\author;


class manage
{
    public $handle;

    public function __construct(handle $handle)
    {
        $this->handle = $handle;
    }

    public function addBooksBase()
    {
        if (!empty($this->handle->booksData)) {
            foreach ($this->handle->booksData as $v) {

                $this->addBook($v);
            }
        }
    }

    public function addBook($data)
    {
        DB::transaction(function () use ($data) {
            book::firstOrCreate(
                [
                    'name' => $data['text'],
                ]
            );
        });
    }

    public function addCate()
    {

    }

    public function addAuthor()
    {

    }
}