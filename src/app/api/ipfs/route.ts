import { NextResponse } from "next/server";

const auth = "Bearer " + process.env.IPFS_ADD_KEY;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      const jsonData = await req.json();
      const blob = new Blob([JSON.stringify(jsonData)], {
        type: "application/json",
      });

      body = new FormData();
      body.append("file", blob, "metadata.json");
    } else if (contentType.includes("multipart/form-data")) {
      body = await req.formData();
    } else {
      const blob = await req.blob();
      body = new FormData();
      body.append("file", blob);
    }
    
    const response = await fetch("https://cdn.digitalax.xyz/api/v0/add", {
      method: "POST",
      headers: {
        authorization: auth,
      },
      body,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    const data = await response.json();
    const cid = data?.Hash;

    const res = NextResponse.json({ hash: cid, cid });
    return res;
  } catch (err: any) {
    console.error(err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
