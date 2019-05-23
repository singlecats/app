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
            DB::beginTransaction();
            try {

                foreach ($this->handle->booksData as &$v) {

                    $this->addBook($v);
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

    public function addBook(&$data)
    {
        DB::beginTransaction();
        try {
            $oBook = book::firstOrCreate(
                [
                    'name' => $data['text'],
                ]
            );
            $data['books_id'] = $oBook->id;
            $oLink = books_link::firstOrCreate(
                [
                    'books_id' => $oBook->id,
                    'from' => $data['isfrom']
                ],
                [
                    'link' => $data['href']
                ]
            );
            $data['books_link_id'] = $oLink->id;
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throwException('事务提交失败');
        }
    }

    public function addCate()
    {

    }

    public function addAuthor()
    {

    }
}