import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import axiosRetry from "axios-retry";

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.response?.status === 429,
});

export async function POST(request: NextRequest) {
  try {
    const { username, cursor = "0" } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const formattedUsername = username.startsWith("@") ? username.substring(1) : username;

    const formData = new URLSearchParams();
    formData.append("unique_id", `@${formattedUsername}`);
    formData.append("count", "6");
    formData.append("cursor", cursor);
    formData.append("web", "1");
    formData.append("hd", "1");

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.9",
      Origin: "https://tikwm.com",
      Referer: "https://tikwm.com/",
    };

    // Hardcoded proxy list
    const proxyList = [
      { host: "50.174.7.156", port: 80 },
      { host: "50.231.104.58", port: 80 },
      { host: "50.217.226.41", port: 80 },
      { host: "3.97.167.115", port: 3128 },
      { host: "52.67.10.183", port: 80 },
      { host: "43.135.154.71", port: 13001 },
    ];

    try {
      const response = await axios.post("https://tikwm.com/api/user/posts", formData.toString(), {
        headers,
      });

      if (response.status !== 200) {
        return NextResponse.json(
          { error: `API request failed with status ${response.status}` },
          { status: response.status }
        );
      }

      return NextResponse.json(response.data);
    } catch (error: any) {
      if (error.message?.includes("Free Api Limit: 1 request/second")) {
        console.log("Rate limit hit, retrying with proxy...");

        const proxyConfig = proxyList[Math.floor(Math.random() * proxyList.length)];

        const proxyResponse = await axios.post("https://tikwm.com/api/user/posts", formData.toString(), {
          headers,
          proxy: proxyConfig,
        });

        if (proxyResponse.status !== 200) {
          return NextResponse.json(
            { error: `Proxy API request failed with status ${proxyResponse.status}` },
            { status: proxyResponse.status }
          );
        }

        return NextResponse.json(proxyResponse.data);
      }

      console.error("Error in TikTok API route:", error);
      return NextResponse.json({ error: "Failed to fetch TikTok videos" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in TikTok API route:", error);
    return NextResponse.json({ error: "Failed to fetch TikTok videos" }, { status: 500 });
  }
}