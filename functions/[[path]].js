export async function onRequest(context) {
  try {
    const TELEGRAPH_URL = 'https://generativelanguage.googleapis.com/v1beta'; // 注意这里包含了 /v1beta
    const request = context.request;
    const url = new URL(request.url);
    
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


   let newBody = {};
    if (request.body) {
        try {
            newBody = await request.json();
        } catch (e) {
            console.error('Error parsing request body:', e);
            return new Response('Invalid request body', { status: 400 });
        }
    }

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

    const modifiedRequest = new Request(newUrl.toString(), {
      headers: request.headers,
      method: 'POST', // 强制使用 POST
      body: JSON.stringify(newBody),
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
    return new Response('An error occurred: ' + error.message, {
      status: 500,
       headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
      }
    });
  }
}
export async function onRequestOptions() {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
