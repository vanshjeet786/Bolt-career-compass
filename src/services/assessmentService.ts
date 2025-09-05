import { supabase } from './supabaseClient';
import { Assessment, AssessmentResponse } from '../types';

export class AssessmentService {
  async saveAssessment(
    userId: string,
    responses: AssessmentResponse[],
    scores: Record<string, number | string>,
    recommendedCareers: string[]
  ): Promise<Assessment> {
    try {
      // Insert main assessment record
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          current_layer: 6
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Prepare responses for database insertion
      const responsesToInsert = responses.map(response => ({
        assessment_id: assessmentData.id,
        layer_number: this.getLayerNumber(response.layer_number),
        question_id: response.question_id,
        response_value: response.response
      }));

      // Insert all responses
      const { error: responsesError } = await supabase
        .from('assessment_responses')
        .insert(responsesToInsert);

      if (responsesError) throw responsesError;

      // Return the complete assessment object
      const assessment: Assessment = {
        id: assessmentData.id,
        user_id: userId,
        completed_at: new Date(assessmentData.completed_at),
        responses,
        scores,
        recommendedCareers,
        mlPrediction: recommendedCareers[0]
      };

      return assessment;
    } catch (error) {
      console.error('Failed to save assessment:', error);
      throw new Error('Failed to save assessment to database');
    }
  }

  async getUserAssessments(userId: string): Promise<Assessment[]> {
    try {
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          id,
          user_id,
          completed_at,
          status
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (assessmentsError) throw assessmentsError;

      if (!assessments || assessments.length === 0) {
        return [];
      }

      // Fetch responses for all assessments
      const assessmentIds = assessments.map(a => a.id);
      const { data: responses, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('*')
        .in('assessment_id', assessmentIds);

      if (responsesError) throw responsesError;

      // Group responses by assessment ID
      const responsesByAssessment: Record<string, any[]> = {};
      responses?.forEach(response => {
        if (!responsesByAssessment[response.assessment_id]) {
          responsesByAssessment[response.assessment_id] = [];
        }
        responsesByAssessment[response.assessment_id].push(response);
      });

      // Build complete assessment objects
      const completeAssessments: Assessment[] = assessments.map(assessment => {
        const assessmentResponses = responsesByAssessment[assessment.id] || [];
        
        // Convert database responses back to application format
        const formattedResponses: AssessmentResponse[] = assessmentResponses.map(dbResponse => ({
          layer_number: dbResponse.layer_number,
          question_id: dbResponse.question_id,
          response: dbResponse.response_value
        }));

        // Calculate scores from responses (simplified for demo)
        const scores = this.calculateScoresFromResponses(formattedResponses);
        const recommendedCareers = this.generateCareerRecommendations(scores);

        return {
          id: assessment.id,
          user_id: assessment.user_id,
          completed_at: new Date(assessment.completed_at),
          responses: formattedResponses,
          scores,
          recommendedCareers,
          mlPrediction: recommendedCareers[0]
        };
      });

      return completeAssessments;
    } catch (error) {
      console.error('Failed to fetch user assessments:', error);
      return [];
    }
  }

  private getLayerNumber(layerIdOrNumber: string | number): number {
    if (typeof layerIdOrNumber === 'number') return layerIdOrNumber;
    
    const layerMap: Record<string, number> = {
      'layer1': 1,
      'layer2': 2,
      'layer3': 3,
      'layer4': 4,
      'layer5': 5,
      'layer6': 6
    };
    
    return layerMap[layerIdOrNumber] || 1;
  }

  private calculateScoresFromResponses(responses: AssessmentResponse[]): Record<string, number> {
    // This is a simplified calculation - you might want to implement more sophisticated logic
    const scoresByCategory: Record<string, number[]> = {};
    
    responses.forEach(response => {
      if (typeof response.response === 'number') {
        const category = this.getCategoryFromQuestionId(response.question_id);
        if (!scoresByCategory[category]) {
          scoresByCategory[category] = [];
        }
        scoresByCategory[category].push(response.response);
      }
    });

    const averageScores: Record<string, number> = {};
    Object.entries(scoresByCategory).forEach(([category, scores]) => {
      if (scores.length > 0) {
        averageScores[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }
    });

    return averageScores;
  }

  private getCategoryFromQuestionId(questionId: string): string {
    // Extract category from question ID pattern (e.g., 'l1-ling-1' -> 'Linguistic')
    if (questionId.includes('ling')) return 'Linguistic';
    if (questionId.includes('math')) return 'Logical-Mathematical';
    if (questionId.includes('inter')) return 'Interpersonal';
    if (questionId.includes('intra')) return 'Intrapersonal';
    if (questionId.includes('spatial')) return 'Visual-Spatial';
    if (questionId.includes('nature')) return 'Naturalistic';
    if (questionId.includes('mbti')) return 'MBTI';
    if (questionId.includes('open')) return 'Big Five - Openness';
    if (questionId.includes('cons')) return 'Big Five - Conscientiousness';
    if (questionId.includes('extra')) return 'Big Five - Extraversion';
    if (questionId.includes('num')) return 'Numerical Aptitude';
    if (questionId.includes('verb')) return 'Verbal Aptitude';
    if (questionId.includes('tech')) return 'Technical Skills';
    if (questionId.includes('edu')) return 'Educational Background';
    if (questionId.includes('career')) return 'Career Exposure';
    if (questionId.includes('interest')) return 'Interests and Passions';
    if (questionId.includes('goals')) return 'Personal Goals and Values';
    
    return 'General';
  }

  private generateCareerRecommendations(scores: Record<string, number>): string[] {
    // Import career mapping logic here or implement simplified version
    const recommendations: string[] = [];
    
    Object.entries(scores).forEach(([category, score]) => {
      if (score >= 4.0) {
        // Add careers based on high scores
        if (category === 'Linguistic') recommendations.push('Journalism', 'Content Writing', 'Teaching');
        if (category === 'Logical-Mathematical') recommendations.push('Data Science', 'Engineering', 'Finance');
        if (category === 'Visual-Spatial') recommendations.push('Graphic Design', 'Architecture', 'UX Design');
        if (category === 'Interpersonal') recommendations.push('Human Resources', 'Psychology', 'Marketing');
        if (category === 'Technical Skills') recommendations.push('Software Development', 'IT Support', 'Cybersecurity');
      }
    });

    return [...new Set(recommendations)].slice(0, 10);
  }
}

export const assessmentService = new AssessmentService();