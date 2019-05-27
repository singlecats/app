<?php


namespace App\Server;

use App\Model\books_link;
use Illuminate\Support\Facades\DB;
use App\Model\book;
use App\Model\author;


class manage
{
    public $handle;

    public function __construct($handle)
    {
        $this->handle = $handle;
    }

    public function addBooksBase()
    {
        if (!empty($this->handle->booksData)) {
            $data = new data();
            DB::beginTransaction();
            try {

                foreach ($this->handle->booksData as &$v) {

                    $data->addBook($v);
                }
                unset($v);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throwException('事务提交失败');
            }
        }
//        print_r($this->handle->booksData);
    }

    public function addCate()
    {

    }

    public function addAuthor()
    {

    }
}