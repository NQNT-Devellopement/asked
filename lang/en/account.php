<?php

return [
    'delete_user' => [
        'section_title' => 'Delete account',
        'section_description' => 'Delete your account and all of its resources',
        'warning' => 'Warning',
        'warning_description' => 'Please proceed with caution, this cannot be undone.',
        'trigger' => 'Delete account',
        'modal_title' => 'Are you sure you want to delete your account?',
        'modal_description' => 'Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.',
        'password_label' => 'Password',
        'password_placeholder' => 'Password',
        'submit' => 'Delete account',
    ],
    'two_factor' => [
        'recovery' => [
            'title' => '2FA recovery codes',
            'description' => 'Recovery codes let you regain access if you lose your 2FA device. Store them in a secure password manager.',
            'show' => 'View recovery codes',
            'hide' => 'Hide recovery codes',
            'regenerate' => 'Regenerate codes',
            'list_label' => 'Recovery codes',
            'loading_label' => 'Loading recovery codes',
            'note_prefix' => 'Each recovery code can be used once to access your account and will be removed after use. If you need more, click',
            'note_action' => 'Regenerate codes',
            'note_suffix' => 'above.',
        ],
        'setup' => [
            'enabled_title' => 'Two-factor authentication enabled',
            'enabled_description' => 'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
            'verify_title' => 'Verify authentication code',
            'verify_description' => 'Enter the 6-digit code from your authenticator app',
            'enable_title' => 'Enable two-factor authentication',
            'enable_description' => 'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
            'manual_separator' => 'or, enter the code manually',
        ],
    ],
    'errors' => [
        'something_wrong' => 'Something went wrong.',
    ],
    'password_input' => [
        'show' => 'Show password',
        'hide' => 'Hide password',
    ],
];
