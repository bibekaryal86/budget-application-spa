import type { Request, Response } from 'express'
import fetch from 'node-fetch'

interface ProxyError {
  error: string
  details: string
}

export async function proxyRequest(req: Request, res: Response, targetBaseUrl: string): Promise<void> {
  const url = targetBaseUrl + req.url

  // Match frontend timeout (15 seconds)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const { host, ...headersWithoutHost } = req.headers

    // Extract only the headers we need, excluding any undefined values
    const headers: Record<string, string> = {}
    for (const [key, value] of Object.entries(headersWithoutHost)) {
      if (value !== undefined) {
        headers[key] = Array.isArray(value) ? value.join(', ') : String(value)
      }
    }

    const isBodyAllowed = !['GET', 'HEAD'].includes(req.method)
    const requestBody = isBodyAllowed && req.body !== undefined ? JSON.stringify(req.body) : undefined

    const upstreamRes = await fetch(url, {
      method: req.method,
      headers,
      signal: controller.signal,
      ...(requestBody !== undefined ? { body: requestBody } : {}),
    })

    clearTimeout(timeout)

    // Handle set-cookie headers
    const rawHeaders = upstreamRes.headers.raw()
    if (rawHeaders['set-cookie']) {
      rawHeaders['set-cookie'].forEach((cookie: string) => {
        res.append('Set-Cookie', cookie)
      })
    }

    // Forward other headers (excluding certain ones)
    upstreamRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (lower === 'set-cookie') return
      if (lower === 'content-encoding') return
      if (lower === 'content-length') return
      if (lower === 'transfer-encoding') return

      res.setHeader(key, value)
    })

    const text = await upstreamRes.text()
    res.status(upstreamRes.status).send(text)
  } catch (err) {
    clearTimeout(timeout)

    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    const errorResponse: ProxyError = {
      error: 'Proxy error',
      details: errorMessage,
    }

    res.status(500).json(errorResponse)
  }
}
