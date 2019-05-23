<?php
namespace App\Server;

interface handle
{
    public function getBooks();
    public function getChapter();
    public function getContent();
}
