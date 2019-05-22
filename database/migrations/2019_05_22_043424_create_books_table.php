<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBooksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('books', function (Blueprint $table) {
            //
            $table->increments('id');
            $table->string('name',100)->comment('书名');
            $table->string('cate', 20)->default('')->comment('分类');
            $table->integer('author')->default(0)->comment('作者');
            $table->integer('sort')->default(999)->comment('排序');
            $table->unique(['name', 'author']);
            $table->softDeletes();
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
        Schema::table('books_', function (Blueprint $table) {
            //

        });
    }
}
