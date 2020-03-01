<?php

namespace App\Console\Commands;

use App\Server\goodServer;
use Illuminate\Console\Command;

class buyKouZhao extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'buy:kouzhao';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $good = new goodServer();
        while (true) {
            echo $good->buy();
            echo PHP_EOL;
            sleep(1);
        }
    }
}
