<?php
namespace App\Server;

interface handle
{
    public function getBooks();
    public function getChapter($from = 0, $bookId = 0);
    public function getContent();
    public function handle();
    public function getChapterList($data);
}
