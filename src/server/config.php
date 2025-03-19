<?php
/**
 * Database connection configuration
 */
return [
    'ENV_MODE' => 'test',  //Change to 'prod' for production

    'prod' => [  //Production environment database configuration
        'host' => 'localhost',
        'dbname' => 'purely_handmade',
        'username' => 'group_user',
        'password' => 'purelyhandmade'
    ],

    'test' => [  //Testing environment database configuration
        'host' => 'localhost',
        'dbname' => 'purely_handmade',
        'username' => 'test_user',
        'password' => 'test'
    ]
];
