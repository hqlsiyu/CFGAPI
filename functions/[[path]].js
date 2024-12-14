const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta';

export async function onRequest(context) {
  try {
    const request = context.request;
    const url = new URL(request.url);

    // 修改 URL 的 host
    const newUrl = new URL(url.pathname + url.search, TELEGRAPH_URL);

    const providedApiKeys = url.searchParams.get('key');
    
    if (!providedApiKeys) {
      return new Response('API key is missing.', { status: 400 });
    }
    
    const apiKeyArray = providedApiKeys.split(';').map(key => key.trim()).filter(key => key !== '');
    if (apiKeyArray.length === 0) {
      return new Response('Valid API key is missing.', { status: 400 });
    }
    
    const selectedApiKey = apiKeyArray[Math.floor(Math.random() * apiKeyArray.length)];
    newUrl.searchParams.set('key', selectedApiKey);

     // 克隆并修改请求体
    let newBody = {};
    if (request.body) {
        try {
          const originalBody = await request.json();
          newBody = { ...originalBody };
        } catch (e) {
             // 如果不是 JSON 请求，则尝试读取文本
            const originalBody = await request.text();
             newBody = originalBody;
        }
    }

     // 添加安全设置参数，只有在请求是 JSON 的时候才添加 safetySetting
    if(typeof newBody === 'object') {
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
    }
      
    const modifiedRequest = new Request(newUrl.toString(), {
      headers: request.headers,
      method: request.method,
      body: typeof newBody === 'object' ? JSON.stringify(newBody) : newBody, // 如果是object则stringify，否则直接使用
      redirect: 'follow'
    });

    const response = await fetch(modifiedRequest);
    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(`API request failed: ${errorBody}`, { status: response.status });
    }

     const modifiedResponse = new Response(response.body, response);
     modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
     modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
     modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return modifiedResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('An error occurred: ' + error.message, { status: 500 });
  }
}


export async function onRequestOptions() {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    });
  }
