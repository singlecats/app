<?php
namespace App\Traits;

trait tableExchange
{
    private static $suffix;
    public static function suffix($suffix)
    {
        static::$suffix = $suffix;
    }

    public function __construct(array $attributes = [])
    {
        $this->table .= static::$suffix;
        parent::__construct($attributes);
    }
}