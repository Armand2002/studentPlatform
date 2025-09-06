import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const searchParams = request.nextUrl.searchParams
  const queryString = searchParams.toString()
  const backendUrl = queryString 
    ? `http://localhost:8000/api/${path}?${queryString}`
    : `http://localhost:8000/api/${path}`
  
  console.log('Proxy GET:', backendUrl)
  
  try {
    // Get authorization header from request
    const authHeader = request.headers.get('authorization')
    
    const response = await fetch(backendUrl, {
      headers: {
        ...(authHeader && { Authorization: authHeader }),
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Proxy GET error for', backendUrl, ':', error)
    return NextResponse.json(
      { error: 'Failed to proxy request', url: backendUrl },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  const backendUrl = `http://localhost:8000/api/${path}`
  
  console.log('Proxy POST:', backendUrl)
  
  try {
    const body = await request.text()
    const authHeader = request.headers.get('authorization')
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        ...(authHeader && { Authorization: authHeader }),
        'Content-Type': 'application/json',
      },
      body,
    })
    
    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Proxy POST error for', backendUrl, ':', error)
    return NextResponse.json(
      { error: 'Failed to proxy request', url: backendUrl },
      { status: 500 }
    )
  }
}
