# PurelyHandmade Database Content

## Database: purely_handmade

## Table: User

| id | email | username | password | firstName | lastName | phone | address | birthday | gender | avatar | role | isAdmin | status | bio | canOrder | createdAt | updatedAt | lastLogin |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 5 | admin@purelyhandmade.com | admin | $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi | Admin | User | NULL | NULL | NULL | NULL | NULL | admin | 1 | active | NULL | 1 | 2025-03-22 11:40:56.132 | 2025-03-23 09:02:03.147 | NULL |
| 6 | user@purelyhandmade.com | user | $2b$10$shnIgQWuHXbUcEnqJyJU0ei3Py80SSbVfBn0qkVcF8Ksc7NlmuIwq | Normal | User | NULL | NULL | NULL | NULL | NULL | user | 0 | active | NULL | 1 | 2025-03-22 11:40:56.190 | 2025-03-22 11:40:56.190 | NULL |
| 7 | customer1@example.com | customer1 | $2b$10$nvqHmLQXfyHNLM8WFlV.9.Q8oeWKScJNUiQFzMZHag6f6XehlJmZO | 张 | 三 | NULL | NULL | NULL | NULL | NULL | user | 0 | active | NULL | 1 | 2025-03-22 11:40:56.359 | 2025-03-22 11:40:56.359 | NULL |
| 8 | customer2@example.com | customer2 | $2b$10$yHzd97VA5i5tdkRkISPETe.ZPTnPTWbDVdqQ7/Axttie1KxhI80xe | 李 | 四 | NULL | NULL | NULL | NULL | NULL | user | 0 | active | NULL | 1 | 2025-03-22 11:40:56.362 | 2025-03-22 11:40:56.362 | NULL |
| 9 | customer3@example.com | customer3 | $2b$10$gjuoQ4TlQ9Q0Fph7bsQRHugKIpNafFmxMm6FZQPnAtA2OsIWnOxWK | 王 | 五 | NULL | NULL | NULL | NULL | NULL | user | 0 | active | NULL | 1 | 2025-03-22 11:40:56.363 | 2025-03-22 11:40:56.363 | NULL |
| 10 | test123@example.com | testuser123 | $2y$12$w53oIi1kbWdceRwIEkvNfOLTLXVCRHGJRFuYX5eCph4GNdHIGH6B2 | Test | User | NULL | NULL | NULL | NULL | NULL | user | 0 | active | NULL | 1 | 2025-03-23 13:28:35.000 | 2025-03-23 13:28:40.000 | 2025-03-23 13:28:40.000 |
| 11 | newadmin@example.com | newadmin | $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi | Admin | User | NULL | NULL | NULL | NULL | NULL | admin | 1 | active | NULL | 1 | 2025-03-23 06:29:43.271 | 2025-03-23 06:29:43.000 | NULL |
| 12 | admin2@example.com | admin2 | $2y$12$jR1DW1WPK6qKacHSQ8LFeua3uFMm/COG/dZjZAcXuQCd/ZPU1Tqaq | Admin | User | NULL | NULL | NULL | NULL | NULL | admin | 1 | active | NULL | 1 | 2025-03-23 13:29:53.000 | 2025-03-23 13:30:09.000 | 2025-03-23 13:30:09.000 |
| 13 | test@example.com | testuser | $2y$12$L6VUI7U7kALspAawUQmVX.bS7M2ieFCa1PCPg9nPyDmM3h3Tvv/iK | NULL | NULL | NULL | NULL | NULL | NULL | NULL | admin | 1 | active | NULL | 1 | 2025-03-23 13:38:24.000 | 2025-03-23 17:39:23.000 | 2025-03-23 17:39:23.000 |
| 14 | admin3@example.com | adminuser | $2y$12$K2SmFzcH4d/QIfxqsSiKnuGtHnM1G/01EL6kTepCrGStAhtHWD9ja | NULL | NULL | NULL | NULL | NULL | NULL | NULL | admin | 1 | active | NULL | 1 | 2025-03-23 13:40:44.000 | 2025-03-23 14:06:00.000 | 2025-03-23 14:06:00.000 |
| 15 | new@example.com | newuser | $2y$12$Q4hsNjfYVN5dBKPCNEOf.OwVFsLW0Ht59f4JvxeuEDAZZi54Ezkzu | New | User | NULL | NULL | NULL | NULL | NULL | user | 0 | active | NULL | 1 | 2025-03-23 14:15:31.000 | 2025-03-23 14:15:31.000 | NULL |
| 16 | testadmin@example.com | testadmin | $2y$12$LLqNoGPDU6wFSKberGox2Ow.M7lKAbRP6IDTnmw7m76wdtX.j1S.O | NULL | NULL | NULL | NULL | NULL | NULL | NULL | user | 1 | active | NULL | 1 | 2025-03-23 14:51:37.000 | 2025-03-23 14:52:42.000 | 2025-03-23 14:52:42.000 |

## Table: Category

| id | name          | slug          | description                            | image | featured | createdAt               | updatedAt               |
+----+---------------+---------------+----------------------------------------+-------+----------+-------------------------+-------------------------+
|  7 | Pottery       | pottery       | Handmade ceramics and pottery artworks | NULL  |        0 | 2025-03-22 11:40:56.365 | 2025-03-22 11:40:56.365 |
|  8 | Woven         | woven         | Handwoven products and accessories     | NULL  |        0 | 2025-03-22 11:40:56.366 | 2025-03-22 11:40:56.366 |
|  9 | Woodwork      | woodwork      | Handmade wooden products and furniture | NULL  |        0 | 2025-03-22 11:40:56.368 | 2025-03-22 11:40:56.368 |
| 10 | Jewelry       | jewelry       | Handcrafted jewelry                    | NULL  |        0 | 2025-03-22 11:40:56.369 | 2025-03-22 11:40:56.369 |
| 11 | Leather       | leather       | Handmade leather goods                 | NULL  |        1 | 2025-03-22 11:40:56.370 | 2025-03-22 11:40:56.370 |
| 12 | Textile       | textile       | Handcrafted textiles and fabric arts   | NULL  |        0 | 2025-03-22 11:40:56.370 | 2025-03-22 11:40:56.370 |
| 13 | Glass         | glass         | Handcrafted glassware and artworks     | NULL  |        1 | 2025-03-22 11:40:56.372 | 2025-03-22 11:40:56.372 |
| 17 | Test Category | test-category | This is a test category                | NULL  |        0 | 2025-03-23 13:41:28.000 | 2025-03-23 13:41:28.000 |

## Table: Designer

| id | name            | slug            | bio                                                                 | image | featured | createdAt               | updatedAt               |
+----+-----------------+-----------------+---------------------------------------------------------------------+-------+----------+-------------------------+-------------------------+
|  4 | James Carter    | james-carter    | A designer specializing in traditional ceramic art                  | NULL  |        0 | 2025-03-22 11:40:56.373 | 2025-03-22 11:40:56.373 |
|  5 | Michael Smith   | michael-smith   | An emerging woodworking artist                                      | NULL  |        0 | 2025-03-22 11:40:56.374 | 2025-03-22 11:40:56.374 |
|  6 | David Brown     | david-brown     | A craftsman with years of experience in weaving                     | NULL  |        0 | 2025-03-22 11:40:56.375 | 2025-03-22 11:40:56.375 |
|  7 | Emily Johnson   | emily-johnson   | An artist focused on modern ceramic design                          | NULL  |        1 | 2025-03-22 11:40:56.376 | 2025-03-22 11:40:56.376 |
|  8 | Sophia Miller   | sophia-miller   | A professional jewelry designer specializing in metal craftsmanship | NULL  |        0 | 2025-03-22 11:40:56.377 | 2025-03-22 11:40:56.377 |
|  9 | Robert Williams | robert-williams | A veteran carpenter specializing in functional furniture design     | NULL  |        1 | 2025-03-22 11:40:56.378 | 2025-03-22 11:40:56.378 |
| 10 | Olivia Davis    | olivia-davis    | A young textile designer blending traditional and modern elements   | NULL  |        1 | 2025-03-22 11:40:56.379 | 2025-03-22 11:40:56.379 |
| 11 | Test Designer   | test-designer   | This is a test designer                                             | NULL  |        0 | 2025-03-23 13:45:09.000 | 2025-03-23 13:45:09.000 |
+-
## Table: Product (First 10 products)

| id | name                               | slug                        | sku  | price | stock | description                                                                                               | image | gallery | featured | active | categoryId | designerId | createdAt               | updatedAt               |
+----+------------------------------------+-----------------------------+------+-------+-------+-----------------------------------------------------------------------------------------------------------+-------+---------+----------+--------+------------+------------+-------------------------+-------------------------+
|  8 | Handmade Ceramic Vase              | handmade-ceramic-vase       | P001 |   299 |    14 | A beautifully handcrafted ceramic vase, fired using traditional techniques. Each piece is unique.         | NULL  | NULL    |        1 |      1 |          7 |          4 | 2025-03-22 11:40:56.380 | 2025-03-22 11:40:56.380 |
|  9 | Handwoven Basket                   | handwoven-basket            | P002 |   199 |    20 | A practical basket handcrafted from natural materials, perfect for storage or decoration.                 | NULL  | NULL    |        1 |      1 |          8 |          6 | 2025-03-22 11:40:56.382 | 2025-03-22 11:40:56.382 |
| 10 | Handmade Wooden Serving Plate      | wooden-serving-plate        | P003 |   249 |    10 | A finely polished wooden serving plate made from high-quality hardwood, featuring natural grain patterns. | NULL  | NULL    |        0 |      1 |          9 |          5 | 2025-03-22 11:40:56.383 | 2025-03-22 11:40:56.383 |
| 11 | Handcrafted Silver Necklace        | handcrafted-silver-necklace | P004 |   399 |     8 | A delicately handcrafted sterling silver necklace with a simple yet elegant design.                       | NULL  | NULL    |        1 |      1 |         10 |          4 | 2025-03-22 11:40:56.384 | 2025-03-22 11:40:56.384 |
| 12 | Ceramic Tea Cup Set                | ceramic-tea-cup-set         | P005 |   349 |    12 | A set of four handcrafted ceramic tea cups, each with unique glaze colors and patterns.                   | NULL  | NULL    |        0 |      1 |          7 |          4 | 2025-03-22 11:40:56.385 | 2025-03-22 11:40:56.385 |
| 13 | Handmade Wooden Jewelry Box        | wooden-jewelry-box          | P006 |   279 |    15 | A beautifully crafted wooden jewelry box with a well-designed interior and exquisite details.             | NULL  | NULL    |        1 |      1 |          9 |          5 | 2025-03-22 11:40:56.387 | 2025-03-22 11:40:56.387 |
| 14 | Handmade Leather Notebook          | leather-notebook            | P007 |   189 |    25 | A handcrafted genuine leather notebook with a luxurious feel, perfect for capturing inspiration.          | NULL  | NULL    |        1 |      1 |         11 |          9 | 2025-03-22 11:40:56.388 | 2025-03-22 11:40:56.388 |
| 15 | Handcrafted Glass Pendant Lamp     | glass-pendant-lamp          | P008 |   459 |     8 | A hand-blown glass pendant lamp with exceptional light diffusion, adding an artistic touch to any home.   | NULL  | NULL    |        1 |      1 |         13 |          7 | 2025-03-22 11:40:56.389 | 2025-03-22 11:40:56.389 |
| 16 | Handwoven Wall Hanging             | woven-wall-hanging          | P009 |   279 |    12 | A fully handwoven wall hanging made from natural materials, featuring a unique design.                    | NULL  | NULL    |        0 |      1 |         12 |         10 | 2025-03-22 11:40:56.390 | 2025-03-22 11:40:56.390 |
| 17 | Handcrafted Metal Pendant Necklace | metal-pendant-necklace      | P010 |   329 |    15 | A handcrafted metal pendant necklace, designed with simplicity yet full of personality.                   | NULL  | NULL    |        1 |      1 |         10 |          8 | 2025-03-22 11:40:56.391 | 2025-03-22 11:40:56.391 |

## Table: Order

| id | userId | orderDate               | status     | totalAmount | shippingInfo                                                                                                                                                                           | paymentInfo                                             | notes                       | createdAt               | updatedAt               |
+----+--------+-------------------------+------------+-------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------+-----------------------------+-------------------------+-------------------------+
|  3 |      6 | 2025-03-04 11:40:56.413 | delivered  |         249 | {"city": "Toronto", "phone": "4161234567", "state": "Ontario", "country": "Canada", "zipCode": "M5V 2T6", "fullName": "John Doe", "streetAddress": "123 Queen St W"}                   | {"method": "creditCard", "status": "completed"}         | NULL                        | 2025-03-22 11:40:56.415 | 2025-03-22 11:40:56.415 |
|  4 |      7 | 2025-03-11 11:40:56.415 | pending    |        1513 | {"city": "Vancouver", "phone": "6049876543", "state": "British Columbia", "country": "Canada", "zipCode": "V6B 1H4", "fullName": "Michael Smith", "streetAddress": "456 Granville St"} | {"method": "PayPal", "status": "completed"}             | NULL                        | 2025-03-22 11:40:56.416 | 2025-03-22 11:40:56.416 |
|  5 |      7 | 2025-02-22 11:40:56.417 | cancelled  |         498 | {"city": "Calgary", "phone": "4037654321", "state": "Alberta", "country": "Canada", "zipCode": "T2P 1J9", "fullName": "Sarah Johnson", "streetAddress": "789 5th Ave SW"}              | {"method": "creditCard", "status": "completed"}         | NULL                        | 2025-03-22 11:40:56.418 | 2025-03-22 11:40:56.418 |
|  6 |      8 | 2025-02-27 11:40:56.418 | pending    |         918 | {"city": "Montreal", "phone": "5146547890", "state": "Quebec", "country": "Canada", "zipCode": "H3B 3Y7", "fullName": "Emily White", "streetAddress": "101 Rue Sainte-Catherine"}      | {"method": "Interac e-Transfer", "status": "completed"} | NULL                        | 2025-03-22 11:40:56.419 | 2025-03-22 11:40:56.419 |
|  7 |      9 | 2025-03-17 11:40:56.420 | delivered  |        1286 | {"city": "Ottawa", "phone": "6139876543", "state": "Ontario", "country": "Canada", "zipCode": "K1P 1A4", "fullName": "David Brown", "streetAddress": "250 Bank St"}                    | {"method": "creditCard", "status": "completed"}         | NULL                        | 2025-03-22 11:40:56.420 | 2025-03-22 11:40:56.420 |
|  8 |      9 | 2025-02-24 11:40:56.421 | processing |         907 | {"city": "Edmonton", "phone": "7804567890", "state": "Alberta", "country": "Canada", "zipCode": "T5J 1Z7", "fullName": "Olivia Davis", "streetAddress": "500 Jasper Ave"}              | {"method": "PayPal", "status": "completed"}             | NULL                        | 2025-03-22 11:40:56.422 | 2025-03-22 11:40:56.422 |
| 12 |     14 | 2025-03-23 06:47:22.000 | pending    |         299 | NULL                                                                                                                                                                                   | NULL                                                    | NULL                        | 2025-03-23 06:47:22.000 | 2025-03-23 06:47:22.000 |
| 13 |      6 | 2025-02-16 09:55:20.000 | delivered  |         459 | {"city": "Toronto", "phone": "4373210987", "state": "Ontario", "country": "Canada", "zipCode": "M4B 1B3", "fullName": "Ethan Wilson", "streetAddress": "678 Bloor St W"}               | {"method": "Interac e-Transfer", "status": "completed"} | Test order from 35 days ago | 2025-02-16 09:55:20.000 | 2025-02-16 09:55:20.000 |
| 14 |      7 | 2025-02-16 09:55:20.000 | cancelled  |         568 | {"city": "Halifax", "phone": "9023216547", "state": "Nova Scotia", "country": "Canada", "zipCode": "B3J 2K9", "fullName": "Sophia Martinez", "streetAddress": "234 Barrington St"}     | {"method": "creditCard", "status": "completed"}         | Test order from 35 days ago | 2025-02-16 09:55:20.000 | 2025-02-16 09:55:20.000 |
| 15 |      8 | 2024-12-23 09:55:20.000 | delivered  |         789 | {"city": "Winnipeg", "phone": "2048765432", "state": "Manitoba", "country": "Canada", "zipCode": "R3C 3H2", "fullName": "William Harris", "streetAddress": "321 Portage Ave"}          | {"method": "creditCard", "status": "completed"}         | Test order from 90 days ago | 2024-12-23 09:55:20.000 | 2024-12-23 09:55:20.000 |

## Table: OrderItem

| id | orderId | productId | quantity | price |
+----+---------+-----------+----------+-------+
|  5 |       3 |        10 |        1 |   249 |
|  6 |       4 |        10 |        3 |   249 |
|  7 |       4 |         9 |        1 |   199 |
|  8 |       4 |        14 |        3 |   189 |
|  9 |       5 |        10 |        2 |   249 |
| 10 |       6 |        15 |        2 |   459 |
| 11 |       7 |        17 |        3 |   329 |
| 12 |       7 |         8 |        1 |   299 |
| 13 |       8 |        16 |        2 |   279 |
| 14 |       8 |        12 |        1 |   349 |

## Table: Review

| id | userId | productId | rating | title                 | content                                                                               | status   | createdAt               | updatedAt               |
+----+--------+-----------+--------+-----------------------+---------------------------------------------------------------------------------------+----------+-------------------------+-------------------------+
|  4 |      6 |         8 |      5 | Great Product         | Worth every penny, excellent quality and design, very satisfied with this purchase.   | approved | 2025-03-22 11:40:56.394 | 2025-03-22 11:40:56.394 |
|  5 |      7 |         8 |      3 | Exceeded Expectations | Worth every penny, excellent quality and design, very satisfied with this purchase.   | approved | 2025-03-22 11:40:56.396 | 2025-03-22 11:40:56.396 |
|  6 |      6 |         9 |      4 | Worth Buying          | The product is even better than expected, very surprising, will continue to support.  | approved | 2025-03-22 11:40:56.397 | 2025-03-22 11:40:56.397 |
|  7 |      7 |         9 |      4 | Worth Buying          | Really like this product, exquisite craftsmanship, unique design, highly recommended! | pending  | 2025-03-22 11:40:56.398 | 2025-03-22 11:40:56.398 |
|  8 |      6 |        10 |      4 | Very Satisfied        | Excellent quality, fine craftsmanship, completely meets my expectations.              | pending  | 2025-03-22 11:40:56.399 | 2025-03-22 11:40:56.399 |
|  9 |      7 |        10 |      4 | Worth Buying          | Good material, decent craftsmanship, but has a minor flaw.                            | pending  | 2025-03-22 11:40:56.400 | 2025-03-22 11:40:56.400 |
| 10 |      6 |        11 |      4 | Very Satisfied        | The product is even better than expected, very surprising, will continue to support.  | pending  | 2025-03-22 11:40:56.401 | 2025-03-22 11:40:56.401 |
| 11 |      7 |        11 |      4 | Very Satisfied        | Really like this product, exquisite craftsmanship, unique design, highly recommended! | pending  | 2025-03-22 11:40:56.401 | 2025-03-22 11:40:56.401 |
| 12 |      6 |        12 |      4 | Exceeded Expectations | Excellent quality, fine craftsmanship, completely meets my expectations.              | pending  | 2025-03-22 11:40:56.402 | 2025-03-22 11:40:56.402 |
| 13 |      7 |        12 |      3 | Exceeded Expectations | Really like this product, exquisite craftsmanship, unique design, highly recommended! | pending  | 2025-03-22 11:40:56.403 | 2025-03-22 11:40:56.403 |

## Table: Settings

| id | key | value | group | createdAt | updatedAt |
|---|---|---|---|---|---|
| 1 | site_name | | general | 2025-03-23 10:13:05.676 | 2025-03-23 17:39:23.000 |
| 2 | contact_email | | general | 2025-03-23 10:13:05.676 | 2025-03-23 17:39:23.000 |
| 3 | phone_number | | general | 2025-03-23 10:13:05.676 | 2025-03-23 17:39:23.000 |
| 4 | address | | general | 2025-03-23 10:13:05.676 | 2025-03-23 17:39:23.000 |
| 5 | facebook_link | | general | 2025-03-23 10:13:05.676 | 2025-03-23 17:39:23.000 |
| 6 | twitter_link | | general | 2025-03-23 10:13:05.676 | 2025-03-23 17:39:23.000 |
| 7 | instagram_link | | general | 2025-03-23 10:13:05.676 | 2025-03-23 17:39:23.000 |

## Table: _prisma_migrations

This table stores database migration history and is managed by Prisma ORM. 