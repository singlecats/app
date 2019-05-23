<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddArticle1Table extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('article_1', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('books_link_id')->default(0)->comment('关联books_link');
            $table->integer('chapter_id')->default(0)->comment('关联chapter');
            $table->text('content')->nullable()->comment('内容');
            $table->timestamps();
            $table->engine = 'myisam';
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('article_1');
    }
}
