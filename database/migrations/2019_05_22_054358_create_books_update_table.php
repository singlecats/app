<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBooksUpdateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('books_update', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('books_id')->default(0)->comment('关联books id');
            $table->integer('books_link_id')->default(0)->comment('关联books_link_id');
            $table->integer('new_cate')->default(1)->comment('最新章节');
            $table->string('new_cate_desc')->default('')->comment('最新章节描述');
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
        Schema::dropIfExists('books_update');
    }
}
