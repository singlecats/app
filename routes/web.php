<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|

| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
 */

Route::get('/', function () {
	echo 111;
	// return view('welcome');
});
Route::get('/foo/{id}', 'Home\IndexController@index');
Route::get('/test',function (){
    echo 123;
});
Route::get('/test', 'Home\IndexController@getChapter');
Route::get('/test/getContent', 'Home\IndexController@getContent');
