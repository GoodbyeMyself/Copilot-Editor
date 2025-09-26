// 用户管理相关函数
function validateUser(user) {
    if (!user.name) {
        return false;
    }
    if (!user.email) {
        return false;
    }
    return true;
}

function createUser(userData) {
    if (validateUser(userData)) {
        console.log("Creating user: " + userData.name);
        return { id: Date.now(), ...userData };
    }
    return null;
}

// 计算相关函数
function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    return total;
}

function calculateDiscount(total, discountPercent) {
    return total * (discountPercent / 100);
}

// 订单处理函数
function processOrder(order) {
    const total = calculateTotal(order.items);
    console.log("Order total: " + total);
    return total;
}

function sendNotification(user, message) {
    console.log("Sending to " + user.email + ": " + message);
}

// 数组处理函数
function findItemById(items, id) {
    for (let i = 0; i < items.length; i++) {
        if (items[i].id === id) {
            return items[i];
        }
    }
    return null;
}

function filterActiveItems(items) {
    let result = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].active === true) {
            result.push(items[i]);
        }
    }
    return result;
}

// 字符串处理函数
function formatPrice(price) {
    return "$" + price.toFixed(2);
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// 示例数据
const sampleUsers = [
    { id: 1, name: "张三", email: "zhang@example.com", active: true },
    { id: 2, name: "李四", email: "li@example.com", active: false }
];

const sampleProducts = [
    { id: 1, name: "苹果", price: 1.5, active: true },
    { id: 2, name: "香蕉", price: 0.8, active: true },
    { id: 3, name: "橙子", price: 2.0, active: false }
];