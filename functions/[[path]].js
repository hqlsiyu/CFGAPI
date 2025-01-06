// 定义 Gemini API 的基础 URL
const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta';

// 监听 Cloudflare Pages 的请求事件
export async function onRequest(context) {
    const request = context.request;
    try {
        const url = new URL(request.url);
        url.host = TELEGRAPH_URL.replace(/^https?:///, '');
        const providedApiKeys = url.searchParams.get('key');

        if (!providedApiKeys) {
            return new Response('API key 缺失。', { status: 400 });
        }

        const apiKeyArray = providedApiKeys.split(';').map(key => key.trim()).filter(key => key !== '');
        if (apiKeyArray.length === 0) {
            return new Response('有效的 API key 缺失。', { status: 400 });
        }

        const selectedApiKey = apiKeyArray[Math.floor(Math.random() * apiKeyArray.length)];
        url.searchParams.set('key', selectedApiKey);

        let newBody = {};
        if (request.body) {
            const originalBody = await request.json();
            newBody = { ...originalBody };
        }

        newBody.safetySettings = [
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
        ];

        // 设置新的请求头，包含韩国的位置信息
        const newHeaders = new Headers(request.headers);
        newHeaders.set('X-Forwarded-For', '203.253.1.1'); // 韩国IP
        newHeaders.set('Accept-Language', 'ko-KR,ko;q=0.9');

        // 创建新的请求对象
        const modifiedRequest = new Request(url.toString(), {
            headers: newHeaders,
            method: request.method,
            body: JSON.stringify(newBody),
            redirect: 'follow'
        });

        const response = await fetch(modifiedRequest);
        if (!response.ok) {
            const errorBody = await response.text();
            return new Response(`API 请求失败: ${errorBody}`, { status: response.status });
        }

        const modifiedResponse = new Response(response.body, response);
        modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
        return modifiedResponse;
    } catch (error) {
        return new Response('发生错误: ' + error.message, { status: 500 });
    }
}
