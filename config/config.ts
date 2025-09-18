import { defineConfig } from "@umijs/max";

import path from "path";
import { execSync } from "child_process";

// 时间戳 标记当前版本更新时间
import dayjs from 'dayjs';

// 路由
import routes from "./routes";

// --- 构建信息：时间与 Git 提交信息 ---
// 构建时间
const BUILD_TIME = dayjs().format('YYYY-MM-DD HH:mm:ss');

let GIT_COMMIT_HASH = "";
let GIT_COMMIT_DATE = "";
let GIT_BRANCH = "";

try {
    GIT_COMMIT_HASH = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    GIT_COMMIT_DATE = execSync('git log -1 --format="%ci"', { encoding: 'utf8' }).trim();
    GIT_BRANCH = execSync('git symbolic-ref --short -q HEAD', { encoding: 'utf8' }).trim();
} catch (error) {
    // 在 CI 或非 git 环境下允许失败
}

export default defineConfig({
    antd: {},
    access: {},
    model: {},
    initialState: {},
    request: {},
    layout: {
        title: "Copilot Editor",
    },
    /**
     * @name 路由的配置，不在路由中引入的文件不会编译
     * @description 只支持 path，component，routes，redirect，wrappers，title 的配置
     * @doc https://umijs.org/docs/guides/routes
     */
    // umi routes: https://umijs.org/docs/routing
    routes,
    npmClient: "yarn",
    tailwindcss: {},
    /**
     * @description: 注入 环境变量
     * @author: M.yunlong
     * @date: 2025-09-01 13:37:43
    */
    define: {
        // ---- 构建信息 ----
        'process.env.__BUILD_TIME__': BUILD_TIME,
        'process.env.__GIT_BRANCH__': GIT_BRANCH,
        'process.env.__GIT_COMMIT_HASH__': GIT_COMMIT_HASH,
        'process.env.__GIT_COMMIT_DATE__': GIT_COMMIT_DATE,
        'process.env.__BUILD_INFO__': JSON.stringify({
            time: BUILD_TIME,
            branch: GIT_BRANCH,
            commitHash: GIT_COMMIT_HASH,
            commitDate: GIT_COMMIT_DATE,
        })
    }
});
