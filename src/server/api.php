<?php
/**
 * API路由器
 * 处理所有API请求并路由到相应的控制器
 */
require_once __DIR__ . '/controllers/models.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/CategoryController.php';
require_once __DIR__ . '/controllers/DesignerController.php';
require_once __DIR__ . '/controllers/OrderController.php';

// 设置响应头
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 处理OPTIONS请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 启动会话
session_start();

// 解析请求路径
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api';

// 移除查询字符串
$path = parse_url($requestUri, PHP_URL_PATH);

// 检查是否是API请求
if (strpos($path, $basePath) !== 0) {
    sendApiResponse("Invalid API path", false, 404);
    exit;
}

// 获取API路径（移除基础路径）
$apiPath = substr($path, strlen($basePath));

// 分割路径
$pathParts = explode('/', trim($apiPath, '/'));
$resource = $pathParts[0] ?? '';
$id = $pathParts[1] ?? null;
$action = $pathParts[2] ?? null;

// 根据资源类型路由到相应的控制器
switch ($resource) {
    case 'products':
        $controller = new ProductController();
        handleProductRequests($controller, $id, $action);
        break;
        
    case 'users':
        $controller = new UserController();
        handleUserRequests($controller, $id, $action);
        break;
        
    case 'categories':
        $controller = new CategoryController();
        handleCategoryRequests($controller, $id, $action);
        break;
        
    case 'designers':
        $controller = new DesignerController();
        handleDesignerRequests($controller, $id, $action);
        break;
        
    case 'orders':
        $controller = new OrderController();
        handleOrderRequests($controller, $id, $action);
        break;
        
    case 'auth':
        $controller = new UserController();
        handleAuthRequests($controller, $id);
        break;
        
    default:
        sendApiResponse("Resource not found: $resource", false, 404);
}

/**
 * 处理产品相关请求
 */
function handleProductRequests($controller, $id, $action) {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        if ($id === null) {
            // GET /api/products
            if (isset($_GET['category'])) {
                $controller->getProductsByCategory($_GET['category']);
            } elseif (isset($_GET['new'])) {
                $days = isset($_GET['days']) ? (int)$_GET['days'] : 7;
                $controller->getNewArrivals($days);
            } elseif (isset($_GET['sale'])) {
                $controller->getOnSaleProducts();
            } elseif (isset($_GET['q'])) {
                $controller->searchProducts();
            } else {
                $controller->getAllProducts();
            }
        } else {
            // GET /api/products/{id}
            $controller->getProduct($id);
        }
    } elseif ($method === 'POST') {
        if ($id !== null && $action === 'reviews') {
            // POST /api/products/{id}/reviews
            $controller->addReview();
        } else {
            sendApiResponse("Invalid product action", false, 400);
        }
    } else {
        sendApiResponse("Method not allowed for products", false, 405);
    }
}

/**
 * 处理用户相关请求
 */
function handleUserRequests($controller, $id, $action) {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        if ($id === 'current') {
            // GET /api/users/current
            $controller->getCurrentUser();
        } else {
            sendApiResponse("Invalid user endpoint", false, 400);
        }
    } elseif ($method === 'PUT') {
        if ($id === 'current') {
            if ($action === 'password') {
                // PUT /api/users/current/password
                $controller->changePassword();
            } else {
                // PUT /api/users/current
                $controller->updateProfile();
            }
        } else {
            sendApiResponse("Invalid user endpoint", false, 400);
        }
    } else {
        sendApiResponse("Method not allowed for users", false, 405);
    }
}

/**
 * 处理认证相关请求
 */
function handleAuthRequests($controller, $action) {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        if ($action === 'register') {
            // POST /api/auth/register
            $controller->register();
        } elseif ($action === 'login') {
            // POST /api/auth/login
            $controller->login();
        } elseif ($action === 'logout') {
            // POST /api/auth/logout
            $controller->logout();
        } else {
            sendApiResponse("Invalid auth endpoint", false, 400);
        }
    } else {
        sendApiResponse("Method not allowed for auth", false, 405);
    }
}

/**
 * 处理类别相关请求
 */
function handleCategoryRequests($controller, $id, $action) {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        if ($id === null) {
            // GET /api/categories
            $controller->getAllCategories();
        } else {
            if ($action === null) {
                // 检查是否是ID或slug
                if (is_numeric($id)) {
                    // GET /api/categories/{id}
                    $controller->getCategory($id);
                } else {
                    // GET /api/categories/{slug}
                    $controller->getCategoryBySlug($id);
                }
            } else {
                sendApiResponse("Invalid category action", false, 400);
            }
        }
    } elseif ($method === 'POST') {
        if ($id === null) {
            // POST /api/categories
            $controller->addCategory();
        } else {
            sendApiResponse("Invalid category endpoint", false, 400);
        }
    } elseif ($method === 'PUT') {
        if ($id !== null && is_numeric($id)) {
            // PUT /api/categories/{id}
            $controller->updateCategory($id);
        } else {
            sendApiResponse("Invalid category endpoint", false, 400);
        }
    } elseif ($method === 'DELETE') {
        if ($id !== null && is_numeric($id)) {
            // DELETE /api/categories/{id}
            $controller->deleteCategory($id);
        } else {
            sendApiResponse("Invalid category endpoint", false, 400);
        }
    } else {
        sendApiResponse("Method not allowed for categories", false, 405);
    }
}

/**
 * 处理设计师相关请求
 */
function handleDesignerRequests($controller, $id, $action) {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        if ($id === null) {
            if (isset($_GET['featured'])) {
                // GET /api/designers?featured=1
                $controller->getFeaturedDesigners();
            } else {
                // GET /api/designers
                $controller->getAllDesigners();
            }
        } else {
            // GET /api/designers/{id}
            $controller->getDesigner($id);
        }
    } elseif ($method === 'POST') {
        if ($id === null) {
            // POST /api/designers
            $controller->addDesigner();
        } else {
            sendApiResponse("Invalid designer endpoint", false, 400);
        }
    } elseif ($method === 'PUT') {
        if ($id !== null) {
            // PUT /api/designers/{id}
            $controller->updateDesigner($id);
        } else {
            sendApiResponse("Invalid designer endpoint", false, 400);
        }
    } elseif ($method === 'DELETE') {
        if ($id !== null) {
            // DELETE /api/designers/{id}
            $controller->deleteDesigner($id);
        } else {
            sendApiResponse("Invalid designer endpoint", false, 400);
        }
    } else {
        sendApiResponse("Method not allowed for designers", false, 405);
    }
}

/**
 * 处理订单相关请求
 */
function handleOrderRequests($controller, $id, $action) {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'GET') {
        if ($id === null) {
            if (isset($_GET['all']) && $_GET['all'] === '1') {
                // GET /api/orders?all=1 (管理员功能)
                $controller->getAllOrders();
            } else {
                // GET /api/orders (获取当前用户订单)
                $controller->getUserOrders();
            }
        } else {
            // GET /api/orders/{id}
            $controller->getOrder($id);
        }
    } elseif ($method === 'POST') {
        if ($id === null) {
            // POST /api/orders
            $controller->createOrder();
        } else {
            sendApiResponse("Invalid order endpoint", false, 400);
        }
    } elseif ($method === 'PUT') {
        if ($id !== null && $action === 'status') {
            // PUT /api/orders/{id}/status
            $controller->updateOrderStatus($id);
        } else {
            sendApiResponse("Invalid order endpoint", false, 400);
        }
    } else {
        sendApiResponse("Method not allowed for orders", false, 405);
    }
} 