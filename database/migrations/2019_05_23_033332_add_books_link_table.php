<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBooksLinkTable extends Migration
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
            $table->integer('books_id')->default(0)->comment('关联books');
            $table->integer('from')->default(0)->comment('来源');
            $table->string('link')->default('')->comment('链接');
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
