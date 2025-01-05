# Gemini API 反向代理 (Cloudflare Pages)

本项目是一个基于 Cloudflare Pages 和 Workers 的 Gemini API 反向代理。它允许您使用多个 API 密钥，并包含一些基本的安全设置。

**本项目的代码由 AI 生成。**

## 如何使用

1.  **部署到 Cloudflare Pages:**
    -   Fork (复制) 此仓库到您的 GitHub 账户。
    -   在您的 Cloudflare 控制面板中，创建一个新的 Pages 项目。
    -   连接您 Fork 的仓库。
    -   构建并部署项目，注意分支选择中使用。

2.  **使用代理:**
    -   向您部署的 Cloudflare Pages URL 发送请求，格式如下：
        ```
        https://your-cloudflare-pages-domain/v1beta/.../?key=YOUR_API_KEY1;YOUR_API_KEY2
        ```
        -   将 `YOUR_API_KEY1;YOUR_API_KEY2` 替换为您 Google Gemini API 密钥，多个密钥之间用分号分隔。
        -   代理将为每个请求随机选择一个您提供的 API 密钥。
    -   确保您的请求体与 Gemini API 期望的结构匹配。

## 安全说明

-   此代理添加了默认的安全设置，对所有有害内容类别均设置为无阻塞。
-   请确保您安全地使用您的 API 密钥。
-   本项目按“原样”提供。使用风险自负。

## 注意事项

-   此代理旨在简化 API 的访问，但您仍需遵守 Gemini API 的使用条款和限制。
-   请妥善保管您的 API 密钥。
