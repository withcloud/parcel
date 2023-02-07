import { upstashRest } from "../lib/upstash";

export const config = {
  runtime: "experimental-edge"
};

export default async function handle(req) {
  try {
    switch (req.method) {
      case "POST": {
        const data = await upstashRest(["SET", "hello", Date.now()]);
        return new Response(
          JSON.stringify({
            data
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          }
        );
      }
      case "GET": {
        const { result } = await upstashRest(["GET", "hello"]);
        return new Response(
          JSON.stringify({
            result
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json"
            }
          }
        );
      }
    }
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: { message: `An error ocurred, ${err}` }
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }
}
