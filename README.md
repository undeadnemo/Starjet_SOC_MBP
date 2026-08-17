# Starjet SOC PC 管理端

基于 Vue Vben Admin 5.7.0 的 Element Plus 2.14.0 应用，实现 ERP 阶段 2 的身份、组织和权限管理。实际开发应用位于 `apps/web-ele`，其他 Vben 示例应用保留作为上游升级参考，不参与生产构建。

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev:ele
corepack pnpm -F @starjet/soc-admin run typecheck
corepack pnpm -F @starjet/soc-admin run build
```

开发服务器使用 `5777` 端口，将 `/api` 代理到 `http://127.0.0.1:22001`。认证采用 Spring Session + Redis + HttpOnly Cookie，前端 Store 中的 `server-session` 只是 Vben 的登录状态标记，不是认证凭证。

已实现页面：部门、岗位、员工、用户、角色与数据范围、权限资源、在线会话、安全审计和 MFA 管理。首次本地启动默认管理员为 `admin / Admin@123456`，生产环境必须在后端设置独立强密码。


