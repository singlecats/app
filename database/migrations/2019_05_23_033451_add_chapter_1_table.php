<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddChapter1Table extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chapter_1', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('books_id')->default(0)->comment('关联books');
            $table->integer('books_link_id')->default(0)->comment('关联books_link');
            $table->integer('chapter_index')->default(1)->nullable()->comment('第n章');
            $table->string('name',50)->default('')->nullable()->comment('名称');
            $table->integer('sort')->default(999)->comment('排序');
            $table->index('books_id');
            $table->index('books_link_id');
            $table->index('name');
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
        Schema::dropIfExists('chapter_1');
    }
}
