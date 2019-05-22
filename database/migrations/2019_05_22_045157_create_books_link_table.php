<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBooksLinkTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('books_link', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('book_id')->default(0)->comment('关联booksID');
            $table->string('link')->default('')->comment('地址');
            $table->integer('isfrom')->default(0)->comment('来源');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('books_link');
    }
}
