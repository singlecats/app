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
Route::get('/getBooks', 'Home\IndexController@index');
Route::get('/getChapter', 'Home\IndexController@getChapter');
Route::get('/getContent', 'Home\IndexController@getContent');
Route::get('/getAllChapter', 'Home\IndexController@getAllChapter');
Route::get('profile', function () {
    // 只有认证过的用户可进入...
})->middleware('auth.basic');
