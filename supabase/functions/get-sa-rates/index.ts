import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const res = await fetch(
    "https://custom.resbank.co.za/SarbWebApi/WebIndicators/CurrentMarketRates"
  );
  const data = await res.json();

  const repo  = data.find((d: any) => d.Name === "SARB Policy Rate")?.Value ?? null;
  const prime = data.find((d: any) => d.Name === "Prime lending rate")?.Value ?? null;

  return new Response(JSON.stringify({ repo, prime }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
