// DEPRECATED: This API route has been moved to the dedicated arena backend service
// New endpoint: http://localhost:3002/api/arena/status
// This file now serves as a redirect to the new backend
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { battleId } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Redirect to the new backend service
    const backendUrl = `http://localhost:3002/api/arena/status${battleId ? `?battleId=${battleId}` : ''}`;
    
    // Forward the request to the new backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
