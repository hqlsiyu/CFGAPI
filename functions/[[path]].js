// 定义 Gemini API 的基础 URL
const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta';

// 监听 Cloudflare Pages 的请求事件
export async function onRequest(context) {
    const request = context.request; // 获取请求对象
    try {
        const url = new URL(request.url); // 解析请求 URL
        url.host = TELEGRAPH_URL.replace(/^https?:\/\//, ''); // 替换请求 URL 的 host 为 Gemini API 的 host
        const providedApiKeys = url.searchParams.get('key'); // 从 URL 参数中获取 API keys

        // 检查是否提供了 API keys
        if (!providedApiKeys) {
            return new Response('API key 缺失。', { status: 400 });
        }

        // 将 API keys 分割成数组并去除空格
        const apiKeyArray = providedApiKeys.split(';').map(key => key.trim()).filter(key => key !== '');
        // 检查是否提供了有效的 API keys
        if (apiKeyArray.length === 0) {
            return new Response('有效的 API key 缺失。', { status: 400 });
        }

        // 从 API keys 数组中随机选择一个 API key
        const selectedApiKey = apiKeyArray[Math.floor(Math.random() * apiKeyArray.length)];
        url.searchParams.set('key', selectedApiKey); // 将选中的 API key 设置到 URL 参数中

        // 克隆并修改请求体
        let newBody = {};
        if (request.body) {
            const originalBody = await request.json(); // 读取原始请求体
            newBody = { ...originalBody }; // 克隆请求体
        }

        // 添加安全设置参数，将所有安全类别设置为无阻塞
        newBody.safetySettings = [
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE'
            },
            {
                category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
                threshold: 'BLOCK_NONE'
            }
        ];

        // 创建新的请求对象，包括修改后的 URL、请求头、请求方法和请求体
        const modifiedRequest = new Request(url.toString(), {
            headers: request.headers,
            method: request.method,
            body: JSON.stringify(newBody),
            redirect: 'follow'
        });

        // 发送修改后的请求到 Gemini API
        const response = await fetch(modifiedRequest);
        if (!response.ok) {
            const errorBody = await response.text(); // 读取错误信息
            return new Response(`API 请求失败: ${errorBody}`, { status: response.status });
        }

        // 创建新的响应对象，并将响应头设置为允许跨域访问
        const modifiedResponse = new Response(response.body, response);
        modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
        return modifiedResponse;
    } catch (error) {
        return new Response('发生错误: ' + error.message, { status: 500 });
    }
}
