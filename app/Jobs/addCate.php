<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Model\articleCate;
use App\Jobs\article;
use Illuminate\Support\Facades\DB;

class addCate implements ShouldQueue
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
        //
        $this->data=$data;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        //
        DB::transaction(function (){
            $articleCate = articleCate::updateOrCreate(['books_link_id' => $this->data['books_link_id'], 'cate_name' => $this->data['cate']],['sort'=>$this->data['sort'],'cate'=>$this->data['sort']]);
            $this->data['article_cate_id']=$articleCate->id;
            article::dispatch($this->data)->onQueue('content');
        });
    }
}
