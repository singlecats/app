<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\DB;
use App\Model\book;
use App\Model\books_link;

class ProcessPodcast implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $data = [];

    public function __construct($data)
    {
        $this->data = $data;

    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $link = '';
        DB::transaction(function () use (&$link) {
            $book = book::firstOrCreate(['name' => $this->data['text'], 'desc' => '']);
            $link = books_link::updateOrCreate(['link' => $this->data['href'], 'book_id' => $book->id], ['book_id' => $book->id, 'isfrom' => $this->data['isfrom']]);
        });
        $this->data['linkid']=$link->id;
    }
}
