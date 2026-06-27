<?php

namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceService
{
    public function generatePdf(Invoice $invoice): string
    {
        $data = [
            'invoice' => $invoice,
            'academy_name' => 'CODEMAFIA Academy',
            'academy_address' => 'Lagos, Nigeria',
            'academy_email' => config('services.academy_email'),
            'academy_phone' => '+234800CODEMAFIA',
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data);
        $pdf->setPaper('A4');

        return $pdf->output();
    }
}
