export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  
  // Only process HTML responses
  if (!contentType.includes('text/html')) {
    return response;
  }
  
  let html = await response.text();
  
  // Inject environment variables
  const envScript = `
    <script>
      window.ENV_SUPABASE_URL = '${Deno.env.get('SUPABASE_URL') || ''}';
      window.ENV_SUPABASE_ANON_KEY = '${Deno.env.get('SUPABASE_ANON_KEY') || ''}';
    </script>
  `;
  
  // Insert before closing </head> tag
  html = html.replace('</head>', `${envScript}</head>`);
  
  return new Response(html, {
    status: response.status,
    headers: response.headers
  });
};

export const config = {
  path: "/*"
};
