<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('vkey', 15)->default('')->comment('vkey')->index();
            $table->string('password')->default('');
            $table->string('name')->default('')->nullable()->comment('昵称');
            $table->string('real_name')->default('')->nullable()->comment('真实姓名');
            $table->string('email',100)->default('')->nullable();
            $table->integer('qq')->default(0)->nullable();
            $table->string('salt')->default('')->nullable()->comment('盐');
            $table->string('remember_token',100)->nullable();
            $table->timestamp('last_login')->nullable()->comment('最后登录时间');
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
        Schema::dropIfExists('user');
    }
}
