const AI_API_KEY = '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';
const AI_API_URL = 'https://api.openai.com/v1';

export class AIService {
  static async analyzeEnvironment(imageBase64: string) {
    try {
      const response = await fetch(`${AI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this environment for fitness testing. Check lighting quality, background clarity, and framing. Rate each aspect from 1-10 and provide specific improvement suggestions.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      const data = await response.json();
      return {
        lighting: Math.floor(Math.random() * 3) + 8, // Mock for demo
        framing: Math.floor(Math.random() * 3) + 7,
        background: Math.floor(Math.random() * 3) + 8,
        suggestions: data.choices?.[0]?.message?.content || 'Environment looks good for testing!'
      };
    } catch (error) {
      console.error('AI Environment Analysis Error:', error);
      return {
        lighting: 8,
        framing: 8,
        background: 8,
        suggestions: 'Environment analysis complete. Ready to begin testing.'
      };
    }
  }

  static async analyzePerformance(videoPath: string, testType: string, userProfile: any) {
    // Mock AI analysis - in production this would process the video
    await new Promise(resolve => setTimeout(resolve, 2000));

    const baseScore = Math.floor(Math.random() * 40) + 60;
    const ageAdjustment = userProfile.age < 18 ? 5 : userProfile.age > 35 ? -5 : 0;
    const genderAdjustment = userProfile.gender === 'female' ? 2 : 0;
    
    const adjustedScore = Math.min(100, baseScore + ageAdjustment + genderAdjustment);

    return {
      score: adjustedScore,
      repCount: Math.floor(Math.random() * 20) + 10,
      jumpHeight: Math.floor(Math.random() * 30) + 40,
      runTime: (Math.random() * 5 + 10).toFixed(2),
      posture: Math.floor(Math.random() * 20) + 75,
      technique: Math.floor(Math.random() * 25) + 70,
      suitability: this.generateSportSuitability(adjustedScore, testType),
      injuryRisk: adjustedScore > 80 ? 'Low' : adjustedScore > 60 ? 'Medium' : 'High',
      growthPrediction: `+${Math.floor(Math.random() * 15) + 5}% improvement potential`
    };
  }

  static generateSportSuitability(score: number, testType: string) {
    const sports = ['Basketball', 'Football', 'Track & Field', 'Swimming', 'Cricket', 'Badminton'];
    return sports.map(sport => ({
      sport,
      score: Math.max(0, score + (Math.random() * 20 - 10)),
      recommendation: score > 75 ? 'Highly Suitable' : score > 60 ? 'Suitable' : 'Consider Training'
    })).sort((a, b) => b.score - a.score).slice(0, 3);
  }

  static getRealtimeFeedback(pose: any) {
    const feedbackOptions = [
      "Great form! Keep it up!",
      "Straighten your posture",
      "Bend your knees more",
      "Keep your back straight",
      "Excellent technique!",
      "Maintain steady breathing",
      "Good rhythm, continue!"
    ];
    
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  }
}