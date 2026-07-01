<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(
        private InvoiceService $invoiceService,
    ) {}

    public function show(Request $request)
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'Missing invoice ID',
            ], 400);
        }

        $invoice = Invoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'error' => 'Invoice not found',
            ], 404);
        }

        if ($invoice->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'invoice' => $invoice,
        ]);
    }

    public function preview(Request $request)
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'Missing invoice ID',
            ], 400);
        }

        $invoice = Invoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'error' => 'Invoice not found',
            ], 404);
        }

        if ($invoice->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized',
            ], 403);
        }

        $data = [
            'invoice' => $invoice,
            'academy_name' => 'CODEMAFIA Academy',
            'academy_address' => 'Lagos, Nigeria',
            'academy_email' => config('services.academy_email'),
            'academy_phone' => '+234800CODEMAFIA',
        ];

        return view('pdf.invoice', $data);
    }

    public function pdf(Request $request)
    {
        $id = $request->query('id');

        if (!$id) {
            return response()->json([
                'success' => false,
                'error' => 'Missing invoice ID',
            ], 400);
        }

        $invoice = Invoice::find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'error' => 'Invoice not found',
            ], 404);
        }

        if ($invoice->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized',
            ], 403);
        }

        try {
            $pdfContent = $this->invoiceService->generatePdf($invoice);

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="CODEMAFIA-Invoice-' . $invoice->invoice_number . '.pdf"',
                'Cache-Control' => 'no-cache',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate PDF',
            ], 500);
        }
    }
}
