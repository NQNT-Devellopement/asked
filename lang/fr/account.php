<?php

return [
    'delete_user' => [
        'section_title' => 'Supprimer le compte',
        'section_description' => 'Supprimer votre compte et toutes ses ressources',
        'warning' => 'Avertissement',
        'warning_description' => 'Veuillez procéder avec prudence, cette action est irréversible.',
        'trigger' => 'Supprimer le compte',
        'modal_title' => 'Êtes-vous sûr de vouloir supprimer votre compte ?',
        'modal_description' => 'Une fois votre compte supprimé, toutes ses ressources et données seront également définitivement supprimées. Veuillez saisir votre mot de passe pour confirmer la suppression définitive de votre compte.',
        'password_label' => 'Mot de passe',
        'password_placeholder' => 'Mot de passe',
        'submit' => 'Supprimer le compte',
    ],
    'two_factor' => [
        'recovery' => [
            'title' => 'Codes de récupération 2FA',
            'description' => 'Les codes de récupération vous permettent de retrouver l’accès à votre compte si vous perdez votre dispositif 2FA. Conservez-les dans un gestionnaire de mots de passe sécurisé.',
            'show' => 'Afficher les codes de récupération',
            'hide' => 'Masquer les codes de récupération',
            'regenerate' => 'Régénérer les codes',
            'list_label' => 'Codes de récupération',
            'loading_label' => 'Chargement des codes de récupération',
            'note_prefix' => 'Chaque code de récupération est utilisable une seule fois pour accéder à votre compte et sera supprimé après utilisation. S’il vous en faut davantage, cliquez sur',
            'note_action' => 'Régénérer les codes',
            'note_suffix' => 'ci-dessus.',
        ],
        'setup' => [
            'enabled_title' => 'Authentification à deux facteurs activée',
            'enabled_description' => 'L’authentification à deux facteurs est maintenant activée. Scannez le code QR ou saisissez la clé de configuration dans votre application d’authentification.',
            'verify_title' => 'Vérifier le code d’authentification',
            'verify_description' => 'Saisissez le code à 6 chiffres de votre application d’authentification',
            'enable_title' => 'Activer l’authentification à deux facteurs',
            'enable_description' => 'Pour terminer l’activation de l’authentification à deux facteurs, scannez le code QR ou saisissez la clé de configuration dans votre application d’authentification',
            'manual_separator' => 'ou, saisissez le code manuellement',
        ],
    ],
    'errors' => [
        'something_wrong' => 'Une erreur est survenue.',
    ],
    'password_input' => [
        'show' => 'Afficher le mot de passe',
        'hide' => 'Masquer le mot de passe',
    ],
];
