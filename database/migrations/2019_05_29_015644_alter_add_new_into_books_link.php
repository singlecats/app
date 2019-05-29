<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterAddNewIntoBooksLink extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('books_link', function (Blueprint $table) {
            //
            $table->integer('new_index')->default(0)->comment('最新章节');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('books_link', function (Blueprint $table) {
            //
            $table->dropColumn('new_index');
        });
    }
}
