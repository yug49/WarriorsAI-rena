// Service for Warriors activation using NEAR AI authentication
export interface WarriorsActivationData {
  name: string;
  bio: string;
  life_history: string;
  adjectives?: string;
  personality?: string[];
  knowledge_areas?: string[] | string;
}

export interface AIActivationResponse {
  role: "assistant" | "user";
  content: string;
}

export interface SignedAuthData {
  signature: string;
  accountId: string;
  publicKey: string;
  message: string;
  nonce: string;
  recipient: string;
  callbackUrl: string;
}

class WarriorsActivationService {
  async activateWarriors(warriorsData: WarriorsActivationData, auth?: SignedAuthData): Promise<string> {
    try {
      console.log('Sending Warriors data for activation:', warriorsData);
      if (auth) {
        console.log('Using frontend-provided auth');
      } else {
        console.log('Using backend signing');
      }
      
      // Call our backend API route
      const requestBody: any = { warriorsData };
      if (auth) {
        requestBody.auth = auth;
      }

      const response = await fetch('/api/activate-warriors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error from NEAR AI activation');
      }

      console.log("NEAR AI Activation Response:", data.response);
      return data.response;

    } catch (error) {
      console.error("Error activating Warriors with NEAR AI:", error);
      throw error;
    }
  }
}

export const warriorsActivationService = new WarriorsActivationService(); 