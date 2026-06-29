<?php

namespace App\Providers;

use App\Models\Proposal;
use App\Models\ServiceOrder;
use App\Models\DiscoveryCall;
use App\Policies\ProposalPolicy;
use App\Policies\ServiceOrderPolicy;
use App\Policies\DiscoveryCallPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Proposal::class => ProposalPolicy::class,
        ServiceOrder::class => ServiceOrderPolicy::class,
        DiscoveryCall::class => DiscoveryCallPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
