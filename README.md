# Lab Dash

自托管家庭实验室服务器管理仪表盘。

## 功能特性
- 服务器状态监控
- Docker 容器管理
- 应用快捷入口
- 系统资源统计
- 中文界面

## 快速部署
```bash
docker run -d -p 2022:2022 -v /var/run/docker.sock:/var/run/docker.sock --name lab-dash wsng911/lab-dash:latest
```
访问 `http://localhost:2022`
