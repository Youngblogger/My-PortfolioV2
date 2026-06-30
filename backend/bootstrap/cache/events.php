<?php return array (
  'App\\Providers\\EventServiceProvider' => 
  array (
    'App\\Events\\UserRegistered' => 
    array (
      0 => 'App\\Listeners\\SendWelcomeEmail',
    ),
    'App\\Events\\PaymentCompleted' => 
    array (
      0 => 
      array (
        0 => 'App\\Listeners\\LogPaymentActivity',
        1 => 'handleCompleted',
      ),
    ),
    'App\\Events\\PaymentFailed' => 
    array (
      0 => 
      array (
        0 => 'App\\Listeners\\LogPaymentActivity',
        1 => 'handleFailed',
      ),
    ),
    'App\\Events\\EnrollmentCreated' => 
    array (
      0 => 'App\\Listeners\\LogEnrollmentActivity',
      1 => 'App\\Listeners\\DispatchEnrollmentEmails',
    ),
  ),
  'Illuminate\\Foundation\\Support\\Providers\\EventServiceProvider' => 
  array (
    'App\\Events\\EnrollmentCreated' => 
    array (
      0 => 'App\\Listeners\\DispatchEnrollmentEmails@handle',
      1 => 'App\\Listeners\\LogEnrollmentActivity@handle',
    ),
    'App\\Events\\PaymentCompleted' => 
    array (
      0 => 'App\\Listeners\\LogPaymentActivity@handleCompleted',
    ),
    'App\\Events\\PaymentFailed' => 
    array (
      0 => 'App\\Listeners\\LogPaymentActivity@handleFailed',
    ),
    'App\\Events\\UserRegistered' => 
    array (
      0 => 'App\\Listeners\\SendWelcomeEmail@handle',
    ),
  ),
);