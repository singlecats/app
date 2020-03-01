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

Route::get('/test', function () {
	echo 111;
	// return view('welcome');
});
Route::get('/getBooks', 'Home\IndexController@index');
Route::get('/getChapter', 'Home\IndexController@getChapter');
Route::get('/getContent', 'Home\IndexController@getContent');
Route::get('/getAllChapter', 'Home\IndexController@getAllChapter');
Route::get('/getNewChapter', 'Home\IndexController@getNewChapter');
Route::get('/login/getLoginQrCode', 'Home\IndexController@getLoginQrCode');
Route::get('/login/check', 'Home\IndexController@checkQrcode');
Route::get('/login/checkTicket', 'Home\IndexController@checkTicket');
Route::get('/getUser', 'Home\IndexController@getUser');
