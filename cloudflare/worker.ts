interface Env {
  API: { fetch(request: Request): Promise<Response> };
  ASSETS: { fetch(request: Request): Promise<Response> };
  ORIGIN_AUTH_TOKEN: string;
}

export default {
  async fetch(request:Request,env:Env):Promise<Response>{
    const url=new URL(request.url);
    if(url.hostname!=='dbms.sld.parswanadh.dev')return new Response('Unknown host',{status:404});
    if(url.protocol!=='https:'){url.protocol='https:';return Response.redirect(url.toString(),308);}
    if(url.pathname==='/api'||url.pathname.startsWith('/api/')){
      if(!env.ORIGIN_AUTH_TOKEN)return Response.json({error:'Service configuration is incomplete.'},{status:503});
      const headers=new Headers(request.headers);
      for(const name of ['x-origin-auth','x-forwarded-for','x-forwarded-host','x-forwarded-proto','forwarded'])headers.delete(name);
      headers.set('x-origin-auth',env.ORIGIN_AUTH_TOKEN);
      headers.set('x-forwarded-host',url.hostname);
      headers.set('x-forwarded-proto','https');
      const clientIp=request.headers.get('cf-connecting-ip');if(clientIp)headers.set('x-forwarded-for',clientIp);
      const target=new URL(`http://127.0.0.1:3000${url.pathname}${url.search}`);
      try{
        const upstream=await env.API.fetch(new Request(target,{method:request.method,headers,body:request.body,redirect:'manual'}));
        const response=new Response(upstream.body,upstream);
        response.headers.delete('x-powered-by');response.headers.set('cache-control','private, no-store');
        return response;
      }catch{
        return Response.json({error:'The university server is currently unavailable. Please try again shortly.'},{status:503,headers:{'cache-control':'no-store'}});
      }
    }
    const response=await env.ASSETS.fetch(request);
    const secured=new Response(response.body,response);
    secured.headers.set('x-content-type-options','nosniff');
    secured.headers.set('referrer-policy','same-origin');
    secured.headers.set('x-frame-options','DENY');
    secured.headers.set('content-security-policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
    return secured;
  }
};
