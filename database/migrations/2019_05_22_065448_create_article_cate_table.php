<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateArticleCateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('article_cate_table', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('books_link_id')->default(0)->comment('关联books_link');
            $table->integer('cate')->default(1)->comment('章节');
            $table->string('cate_name',100)->default('')->comment('章节名称');
            $table->integer('sort')->default(999)->comment('排序');
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
        Schema::dropIfExists('article_cate_table');
    }
}
