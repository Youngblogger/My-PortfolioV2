<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ProjectType;
use App\Models\AddOn;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'slug' => $s->slug,
                'title' => $s->title,
                'subtitle' => $s->subtitle,
                'short_description' => $s->short_description,
                'icon' => $s->icon,
                'image_url' => $s->image_url,
                'cover_url' => $s->cover_url,
                'starting_price_ngn' => (float) $s->starting_price_ngn,
                'starting_price_usd' => (float) $s->starting_price_usd,
                'estimated_delivery' => $s->estimated_delivery,
                'features' => $s->features,
                'project_types_count' => $s->activeProjectTypes()->count(),
            ]);

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    public function show($slug)
    {
        $service = Service::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$service) {
            return response()->json([
                'success' => false,
                'error' => 'Service not found.',
            ], 404);
        }

        $projectTypes = $service->activeProjectTypes()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($pt) => [
                'id' => $pt->id,
                'slug' => $pt->slug,
                'title' => $pt->title,
                'subtitle' => $pt->subtitle,
                'short_description' => $pt->short_description,
                'icon' => $pt->icon,
                'image_url' => $pt->image_url,
                'starting_price_ngn' => (float) $pt->starting_price_ngn,
                'starting_price_usd' => (float) $pt->starting_price_usd,
                'estimated_timeline' => $pt->estimated_timeline,
                'features' => $pt->features,
                'technologies' => $pt->technologies,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $service->id,
                'slug' => $service->slug,
                'title' => $service->title,
                'subtitle' => $service->subtitle,
                'short_description' => $service->short_description,
                'description' => $service->description,
                'icon' => $service->icon,
                'image_url' => $service->image_url,
                'cover_url' => $service->cover_url,
                'starting_price_ngn' => (float) $service->starting_price_ngn,
                'starting_price_usd' => (float) $service->starting_price_usd,
                'estimated_delivery' => $service->estimated_delivery,
                'features' => $service->features,
                'project_types' => $projectTypes,
            ],
        ]);
    }

    public function projectType($serviceSlug, $projectSlug)
    {
        $service = Service::where('slug', $serviceSlug)->where('is_active', true)->first();

        if (!$service) {
            return response()->json(['success' => false, 'error' => 'Service not found.'], 404);
        }

        $projectType = ProjectType::where('slug', $projectSlug)
            ->where('service_id', $service->id)
            ->where('is_active', true)
            ->first();

        if (!$projectType) {
            return response()->json(['success' => false, 'error' => 'Project type not found.'], 404);
        }

        $packages = $projectType->activePackages()
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'slug' => $p->slug,
                'name' => $p->name,
                'description' => $p->description,
                'price_ngn' => (float) $p->price_ngn,
                'price_usd' => (float) $p->price_usd,
                'estimated_timeline' => $p->estimated_timeline,
                'support_period' => $p->support_period,
                'revision_count' => $p->revision_count,
                'is_recommended' => $p->is_recommended,
                'features' => $p->features,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $projectType->id,
                'slug' => $projectType->slug,
                'title' => $projectType->title,
                'subtitle' => $projectType->subtitle,
                'short_description' => $projectType->short_description,
                'description' => $projectType->description,
                'icon' => $projectType->icon,
                'image_url' => $projectType->image_url,
                'cover_url' => $projectType->cover_url,
                'starting_price_ngn' => (float) $projectType->starting_price_ngn,
                'starting_price_usd' => (float) $projectType->starting_price_usd,
                'estimated_timeline' => $projectType->estimated_timeline,
                'features' => $projectType->features,
                'technologies' => $projectType->technologies,
                'deliverables' => $projectType->deliverables,
                'faqs' => $projectType->faqs,
                'portfolio_samples' => $projectType->portfolio_samples,
                'packages' => $packages,
                'service' => [
                    'id' => $service->id,
                    'slug' => $service->slug,
                    'title' => $service->title,
                ],
            ],
        ]);
    }

    public function addOns()
    {
        $addOns = AddOn::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('category')
            ->get()
            ->groupBy('category')
            ->map(fn ($items, $category) => [
                'category' => $category ?: 'General',
                'items' => $items->map(fn ($a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'slug' => $a->slug,
                    'description' => $a->description,
                    'icon' => $a->icon,
                    'price_ngn' => (float) $a->price_ngn,
                    'price_usd' => (float) $a->price_usd,
                ]),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => $addOns,
        ]);
    }
}
