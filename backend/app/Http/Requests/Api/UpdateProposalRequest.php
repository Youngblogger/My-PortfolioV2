<?php

namespace App\Http\Requests\Api;

use App\Models\Proposal;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        $proposal = Proposal::find($this->route('id'));

        return $proposal && (
            $proposal->user_id === $this->user()?->id ||
            $this->user()?->profile?->role === 'admin'
        );
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:draft,sent,viewed,approved,rejected,revision_requested'],
        ];
    }
}
