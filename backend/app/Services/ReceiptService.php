<?php

namespace App\Services;

use App\Models\Receipt;
use Barryvdh\DomPDF\Facade\Pdf;

class ReceiptService
{
    public function generatePdf(Receipt $receipt): string
    {
        $data = [
            'receipt' => $receipt,
            'academy_name' => 'CODEMAFIA Academy',
            'academy_address' => 'Lagos, Nigeria',
            'academy_email' => config('services.academy_email'),
            'academy_phone' => '+234800CODEMAFIA',
        ];

        $pdf = Pdf::loadView('pdf.receipt', $data);
        $pdf->setPaper('A4');

        return $pdf->output();
    }
}
