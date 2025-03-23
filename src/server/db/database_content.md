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

| id | name | slug | description | image | featured | createdAt | updatedAt |
|---|---|---|---|---|---|---|---|
| 7 | 陶瓷 | pottery | 手工陶瓷和陶艺作品 | NULL | 0 | 2025-03-22 11:40:56.365 | 2025-03-22 11:40:56.365 |
| 8 | 编织 | woven | 手工编织的产品和饰品 | NULL | 0 | 2025-03-22 11:40:56.366 | 2025-03-22 11:40:56.366 |
| 9 | 木工 | woodwork | 手工木制品和家具 | NULL | 0 | 2025-03-22 11:40:56.368 | 2025-03-22 11:40:56.368 |
| 10 | 首饰 | jewelry | 手工制作的首饰 | NULL | 0 | 2025-03-22 11:40:56.369 | 2025-03-22 11:40:56.369 |
| 11 | 皮革 | leather | 手工皮革制品 | NULL | 1 | 2025-03-22 11:40:56.370 | 2025-03-22 11:40:56.370 |
| 12 | 纺织 | textile | 手工纺织品和布艺作品 | NULL | 0 | 2025-03-22 11:40:56.370 | 2025-03-22 11:40:56.370 |
| 13 | 玻璃 | glass | 手工玻璃制品和工艺品 | NULL | 1 | 2025-03-22 11:40:56.372 | 2025-03-22 11:40:56.372 |
| 17 | Test Category | test-category | This is a test category | NULL | 0 | 2025-03-23 13:41:28.000 | 2025-03-23 13:41:28.000 |

## Table: Designer

| id | name | slug | bio | image | featured | createdAt | updatedAt |
|---|---|---|---|---|---|---|---|
| 4 | 张艺 | zhang-yi | 专注于传统陶瓷艺术的设计师 | NULL | 0 | 2025-03-22 11:40:56.373 | 2025-03-22 11:40:56.373 |
| 5 | 李明 | li-ming | 新锐木工艺术家 | NULL | 0 | 2025-03-22 11:40:56.374 | 2025-03-22 11:40:56.374 |
| 6 | 王华 | wang-hua | 多年编织工艺经验的工匠 | NULL | 0 | 2025-03-22 11:40:56.375 | 2025-03-22 11:40:56.375 |
| 7 | 赵静 | zhao-jing | 专注于现代陶瓷设计的艺术家 | NULL | 1 | 2025-03-22 11:40:56.376 | 2025-03-22 11:40:56.376 |
| 8 | 刘芳 | liu-fang | 专业珠宝设计师，擅长金属工艺 | NULL | 0 | 2025-03-22 11:40:56.377 | 2025-03-22 11:40:56.377 |
| 9 | 陈勇 | chen-yong | 资深木匠，专注实用家具设计 | NULL | 1 | 2025-03-22 11:40:56.378 | 2025-03-22 11:40:56.378 |
| 10 | 林小雨 | lin-xiaoyu | 年轻的织物设计师，结合传统与现代元素 | NULL | 1 | 2025-03-22 11:40:56.379 | 2025-03-22 11:40:56.379 |
| 11 | Test Designer | test-designer | This is a test designer | NULL | 0 | 2025-03-23 13:45:09.000 | 2025-03-23 13:45:09.000 |

## Table: Product (First 10 products)

| id | name | slug | sku | price | stock | description | image | gallery | featured | active | createdAt | updatedAt | categoryId | designerId |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 8 | 手工陶瓷花瓶 | handmade-ceramic-vase | P001 | 299 | 14 | 精美手工陶瓷花瓶，采用传统工艺烧制而成，每件都独一无二。 | NULL | NULL | 1 | 1 | 2025-03-22 11:40:56.380 | 2025-03-22 11:40:56.380 | 7 | 4 |
| 9 | 手工编织篮子 | handwoven-basket | P002 | 199 | 20 | 由天然材料手工编织而成的实用篮子，可用于储物或装饰。 | NULL | NULL | 1 | 1 | 2025-03-22 11:40:56.382 | 2025-03-22 11:40:56.382 | 8 | 6 |
| 10 | 手工木制餐盘 | wooden-serving-plate | P003 | 249 | 10 | 精心打磨的木制餐盘，采用优质硬木制作，自然纹理美观。 | NULL | NULL | 0 | 1 | 2025-03-22 11:40:56.383 | 2025-03-22 11:40:56.383 | 9 | 5 |
| 11 | 手工银饰项链 | handcrafted-silver-necklace | P004 | 399 | 8 | 精致手工制作的纯银项链，设计简约而优雅。 | NULL | NULL | 1 | 1 | 2025-03-22 11:40:56.384 | 2025-03-22 11:40:56.384 | 10 | 4 |
| 12 | 手工陶瓷茶杯套装 | ceramic-tea-cup-set | P005 | 349 | 12 | 四件套手工陶瓷茶杯，每个都有独特的釉色和纹理。 | NULL | NULL | 0 | 1 | 2025-03-22 11:40:56.385 | 2025-03-22 11:40:56.385 | 7 | 4 |
| 13 | 手工木制首饰盒 | wooden-jewelry-box | P006 | 279 | 15 | 精美木制首饰盒，内部设计合理，细节处理精致。 | NULL | NULL | 1 | 1 | 2025-03-22 11:40:56.387 | 2025-03-22 11:40:56.387 | 9 | 5 |
| 14 | 手工皮革笔记本 | leather-notebook | P007 | 189 | 25 | 手工制作的真皮笔记本，质感极佳，随时记录灵感。 | NULL | NULL | 1 | 1 | 2025-03-22 11:40:56.388 | 2025-03-22 11:40:56.388 | 11 | 9 |
| 15 | 手工玻璃吊灯 | glass-pendant-lamp | P008 | 459 | 8 | 手工吹制玻璃吊灯，透光效果绝佳，为家居增添艺术氛围。 | NULL | NULL | 1 | 1 | 2025-03-22 11:40:56.389 | 2025-03-22 11:40:56.389 | 13 | 7 |
| 16 | 手工编织挂毯 | woven-wall-hanging | P009 | 279 | 12 | 纯手工编织的墙面装饰挂毯，采用天然材料，设计独特。 | NULL | NULL | 0 | 1 | 2025-03-22 11:40:56.390 | 2025-03-22 11:40:56.390 | 12 | 10 |
| 17 | 手工金属项链 | metal-pendant-necklace | P010 | 329 | 15 | 手工锻造的金属吊坠项链，设计简约而不失个性。 | NULL | NULL | 1 | 1 | 2025-03-22 11:40:56.391 | 2025-03-22 11:40:56.391 | 10 | 8 |

## Table: Order

| id | userId | orderDate | status | totalAmount | shippingInfo | paymentInfo | notes | createdAt | updatedAt |
|---|---|---|---|---|---|---|---|---|---|
| 3 | 6 | 2025-03-04 11:40:56.413 | delivered | 249 | {"city": "北京", "phone": "1901454608", "state": "北京", "country": "中国", "zipCode": "518000", "fullName": "Normal User", "streetAddress": "测试地址街道"} | {"method": "wechat", "status": "completed"} | NULL | 2025-03-22 11:40:56.415 | 2025-03-22 11:40:56.415 |
| 4 | 7 | 2025-03-11 11:40:56.415 | pending | 1513 | {"city": "深圳", "phone": "1904349752", "state": "广东", "country": "中国", "zipCode": "510000", "fullName": "张 三", "streetAddress": "测试地址街道"} | {"method": "wechat", "status": "completed"} | NULL | 2025-03-22 11:40:56.416 | 2025-03-22 11:40:56.416 |
| 5 | 7 | 2025-02-22 11:40:56.417 | cancelled | 498 | {"city": "深圳", "phone": "1509382410", "state": "广东", "country": "中国", "zipCode": "100000", "fullName": "张 三", "streetAddress": "测试地址街道"} | {"method": "creditCard", "status": "completed"} | NULL | 2025-03-22 11:40:56.418 | 2025-03-22 11:40:56.418 |
| 6 | 8 | 2025-02-27 11:40:56.418 | pending | 918 | {"city": "深圳", "phone": "1203795809", "state": "广东", "country": "中国", "zipCode": "100000", "fullName": "李 四", "streetAddress": "测试地址街道"} | {"method": "alipay", "status": "completed"} | NULL | 2025-03-22 11:40:56.419 | 2025-03-22 11:40:56.419 |
| 7 | 9 | 2025-03-17 11:40:56.420 | delivered | 1286 | {"city": "深圳", "phone": "1500773508", "state": "广东", "country": "中国", "zipCode": "100000", "fullName": "王 五", "streetAddress": "测试地址街道"} | {"method": "creditCard", "status": "completed"} | NULL | 2025-03-22 11:40:56.420 | 2025-03-22 11:40:56.420 |
| 8 | 9 | 2025-02-24 11:40:56.421 | processing | 907 | {"city": "广州", "phone": "1205532741", "state": "广东", "country": "中国", "zipCode": "100000", "fullName": "王 五", "streetAddress": "测试地址街道"} | {"method": "wechat", "status": "completed"} | NULL | 2025-03-22 11:40:56.422 | 2025-03-22 11:40:56.422 |
| 12 | 14 | 2025-03-23 06:47:22.000 | pending | 299 | NULL | NULL | NULL | 2025-03-23 06:47:22.000 | 2025-03-23 06:47:22.000 |
| 13 | 6 | 2025-02-16 09:55:20.000 | delivered | 459 | {"city": "北京", "phone": "13912345678", "state": "北京", "country": "中国", "zipCode": "100000", "fullName": "测试用户", "streetAddress": "测试地址35-1"} | {"method": "alipay", "status": "completed"} | 35天前的测试订单1 | 2025-02-16 09:55:20.000 | 2025-02-16 09:55:20.000 |
| 14 | 7 | 2025-02-16 09:55:20.000 | cancelled | 568 | {"city": "上海", "phone": "13887654321", "state": "上海", "country": "中国", "zipCode": "200000", "fullName": "测试用户2", "streetAddress": "测试地址35-2"} | {"method": "wechat", "status": "completed"} | 35天前的测试订单2 | 2025-02-16 09:55:20.000 | 2025-02-16 09:55:20.000 |
| 15 | 8 | 2024-12-23 09:55:20.000 | delivered | 789 | {"city": "广州", "phone": "13765432109", "state": "广东", "country": "中国", "zipCode": "510000", "fullName": "测试用户3", "streetAddress": "测试地址90-1"} | {"method": "creditCard", "status": "completed"} | 90天前的测试订单1 | 2024-12-23 09:55:20.000 | 2024-12-23 09:55:20.000 |

## Table: OrderItem

| id | orderId | productId | quantity | price |
|---|---|---|---|---|
| 5 | 3 | 10 | 1 | 249 |
| 6 | 4 | 10 | 3 | 249 |
| 7 | 4 | 9 | 1 | 199 |
| 8 | 4 | 14 | 3 | 189 |
| 9 | 5 | 10 | 2 | 249 |
| 10 | 6 | 15 | 2 | 459 |
| 11 | 7 | 17 | 3 | 329 |
| 12 | 7 | 8 | 1 | 299 |
| 13 | 8 | 16 | 2 | 279 |
| 14 | 8 | 12 | 1 | 349 |

## Table: Review

| id | userId | productId | rating | title | content | status | createdAt | updatedAt |
|---|---|---|---|---|---|---|---|---|
| 4 | 6 | 8 | 5 | 很好的产品 | 物超所值，质量和设计都很棒，很满意这次购买。 | approved | 2025-03-22 11:40:56.394 | 2025-03-22 11:40:56.394 |
| 5 | 7 | 8 | 3 | 超出预期 | 物超所值，质量和设计都很棒，很满意这次购买。 | approved | 2025-03-22 11:40:56.396 | 2025-03-22 11:40:56.396 |
| 6 | 6 | 9 | 4 | 值得购买 | 收到货比想象中的还要好，很惊喜，会继续支持。 | approved | 2025-03-22 11:40:56.397 | 2025-03-22 11:40:56.397 |
| 7 | 7 | 9 | 4 | 值得购买 | 非常喜欢这个产品，做工精美，设计独特，值得推荐！ | pending | 2025-03-22 11:40:56.398 | 2025-03-22 11:40:56.398 |
| 8 | 6 | 10 | 4 | 非常满意 | 质量非常好，做工精细，完全符合我的期望。 | pending | 2025-03-22 11:40:56.399 | 2025-03-22 11:40:56.399 |
| 9 | 7 | 10 | 4 | 值得购买 | 材质很好，做工也不错，但是有一点小瑕疵。 | pending | 2025-03-22 11:40:56.400 | 2025-03-22 11:40:56.400 |
| 10 | 6 | 11 | 4 | 非常满意 | 收到货比想象中的还要好，很惊喜，会继续支持。 | pending | 2025-03-22 11:40:56.401 | 2025-03-22 11:40:56.401 |
| 11 | 7 | 11 | 4 | 非常满意 | 非常喜欢这个产品，做工精美，设计独特，值得推荐！ | pending | 2025-03-22 11:40:56.401 | 2025-03-22 11:40:56.401 |
| 12 | 6 | 12 | 4 | 超出预期 | 质量非常好，做工精细，完全符合我的期望。 | pending | 2025-03-22 11:40:56.402 | 2025-03-22 11:40:56.402 |
| 13 | 7 | 12 | 3 | 超出预期 | 非常喜欢这个产品，做工精美，设计独特，值得推荐！ | pending | 2025-03-22 11:40:56.403 | 2025-03-22 11:40:56.403 |

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