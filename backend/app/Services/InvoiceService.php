<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\ServiceInvoice;
use App\Models\ServiceOrder;
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

    public function generateServiceInvoicePdf(ServiceInvoice $invoice, ServiceOrder $order): string
    {
        $order->loadMissing(['user.profile', 'service', 'projectType', 'package', 'addOns', 'payments']);

        $data = [
            'invoice' => $invoice,
            'order' => $order,
        ];

        $pdf = Pdf::loadView('pdf.service-invoice', $data);
        $pdf->setPaper('A4');

        return $pdf->output();
    }
}
