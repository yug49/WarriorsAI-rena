// DEPRECATED: This API route has been moved to the dedicated arena backend service
// New endpoint: http://localhost:3002/api/arena/commands
// This file now serves as a redirect to the new backend
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { battleId } = req.query;
  
  try {
    // Redirect to the new backend service
    const backendUrl = `http://localhost:3002/api/arena/commands${battleId ? `?battleId=${battleId}` : ''}`;
    
    // Forward the request to the new backend
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });
    
    const data = await response.json();
    
    // Return the response from the backend
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Error redirecting to backend:', error);
    res.status(500).json({ 
      error: 'Backend service unavailable. Please ensure the arena backend is running on port 3002.',
      originalError: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
