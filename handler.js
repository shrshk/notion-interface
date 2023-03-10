import fetch from "node-fetch";
import { Buffer } from "buffer";
import { markdownToBlocks, markdownToRichText } from "@tryfabric/martian";

export const markdownToNotion = async (event) => {
  console.log("event ", event)
  const body = JSON.parse(event.body)
  const { markdown } = body;
  const { method } = body;

  if (markdown == null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'no markdown provided'
      })
    }
  }

  let notionBlocks;

  if (method!=null && method==='markdownToRichText') {
    notionBlocks = markdownToBlocks(markdown)
  } else {
    notionBlocks = markdownToRichText(markdown)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      notionBlocks
    })
  }

}

export const getAuthToken = async (event) => {
  console.log("event: ",event);
  const body = JSON.parse(event.body);
  const { code, redirectUri } = body;
  if (code == null || redirectUri == null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'no code or redirectUri provided'
      })
    }
  }
  try {
    const data = await exchangeCodeForAuthToken(code, redirectUri);
    return {
      statusCode: 200,
      body: JSON.stringify(
        data
      )
    }
  } catch (e) {
    console.log('error in getting authToken ' + e)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'error fetching data'
      })
    }
  }
};

async function exchangeCodeForAuthToken(code) {
  try {
    const CLIENT_ID = process.env.NOTION_CLIENT_ID
    const CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET
    const buffer = Buffer.from(CLIENT_ID+':'+CLIENT_SECRET)
    const idSecret = buffer.toString('base64')
    const response = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + idSecret
      },
      body: JSON.stringify({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri
      })
    });
    return await response.json()
  } catch (error) {
    console.error('error from notion' + error);
  }
}