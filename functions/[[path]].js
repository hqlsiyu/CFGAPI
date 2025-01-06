// 定义 Gemini API 的基础 URL
const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta';

// 需要阻止的地区列表
const BLOCKED_REGIONS = ['HK', 'TW'];
// 模拟的地区（韩国）
const SPOOFED_COUNTRY = 'KR';

// 监听 Cloudflare Pages 的请求事件
export async function onRequest(context) {
    const request = context.request;
    const cf = request.cf; // 获取 Cloudflare 的请求信息

    try {
        // 检查用户的地理位置
        if (cf) {
            const userCountry = cf.country;
            
            // 如果用户来自被阻止的地区，返回错误响应
            if (BLOCKED_REGIONS.includes(userCountry)) {
                return new Response('Access denied based on your location.', { 
                    status: 403,
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        }

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

        // 添加安全设置参数
        newBody.safetySettings = [
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' }
        ];

        // 添加位置相关的请求头
        const headers = new Headers(request.headers);
        headers.set('X-Forwarded-For', '203.253.1.1'); // 韩国IP地址
        headers.set('CF-IPCountry', SPOOFED_COUNTRY);

        // 创建新的请求对象
        const modifiedRequest = new Request(url.toString(), {
            headers: headers,
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
