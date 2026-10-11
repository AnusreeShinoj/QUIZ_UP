import { Quiz, QuizAttempt, QuestionReview, TopicPerformance, RecommendedQuizItem, ClientQuestion } from '../types/quiz';

/**
 * Strips correct answers and explanations before sending quiz to test taker
 */
export function sanitizeQuizForTestTaker(quiz: Quiz): Omit<Quiz, 'questions'> & { questions: ClientQuestion[] } {
  return {
    ...quiz,
    questions: quiz.questions.map(q => ({
      id: q.id,
      text: q.text,
      topic: q.topic,
      options: q.options,
      points: q.points || 1
    }))
  };
}

/**
 * Evaluates quiz answers on the server / securely using standard conditional JavaScript
 */
export function evaluateQuizSubmission(
  quiz: Quiz,
  submittedAnswers: Record<string, number | null | undefined>,
  timeTakenSeconds: number,
  user: { uid: string; displayName?: string | null; email?: string | null }
): QuizAttempt {
  let score = 0;
  let maxScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const topicMap: Record<string, { total: number; correct: number }> = {};
  const questionReviews: QuestionReview[] = [];

  for (const q of quiz.questions) {
    const qPoints = q.points || 1;
    maxScore += qPoints;

    const selected = submittedAnswers[q.id];
    const isAnswered = selected !== null && selected !== undefined && selected >= 0;
    const isCorrect = isAnswered && selected === q.correctOptionIndex;

    // Track topic metrics
    const topicName = q.topic?.trim() || quiz.topic || 'General';
    if (!topicMap[topicName]) {
      topicMap[topicName] = { total: 0, correct: 0 };
    }
    topicMap[topicName].total += 1;

    if (isCorrect) {
      score += qPoints;
      correctCount += 1;
      topicMap[topicName].correct += 1;
    } else if (isAnswered) {
      incorrectCount += 1;
    } else {
      unansweredCount += 1;
    }

    questionReviews.push({
      questionId: q.id,
      questionText: q.text,
      topic: topicName,
      options: q.options,
      selectedOption: isAnswered ? (selected as number) : null,
      correctOption: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation || 'No explanation provided.',
      pointsEarned: isCorrect ? qPoints : 0
    });
  }

  const answeredTotal = correctCount + incorrectCount;
  const accuracy = answeredTotal > 0 ? Math.round((correctCount / answeredTotal) * 100) : 0;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // Topic breakdown and < 50% weakness calculation
  const topicBreakdown: TopicPerformance[] = Object.entries(topicMap).map(([topic, stats]) => {
    const topicAcc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return {
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy: topicAcc,
      needsPractice: topicAcc < 50 // Standard college project requirement: <50% needs practice
    };
  });

  const weakTopics = topicBreakdown
    .filter(tb => tb.needsPractice)
    .map(tb => tb.topic);

  const attemptId = 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  return {
    id: attemptId,
    quizId: quiz.id,
    quizTitle: quiz.title,
    quizSubject: quiz.subject,
    quizTopic: quiz.topic,
    difficulty: quiz.difficulty,
    userId: user.uid,
    userName: user.displayName || user.email?.split('@')[0] || 'Student',
    userEmail: user.email || '',
    score,
    maxScore,
    percentage,
    totalQuestions: quiz.questions.length,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unanswered: unansweredCount,
    accuracy,
    timeTakenSeconds,
    submittedAt: new Date().toISOString(),
    topicBreakdown,
    weakTopics,
    questionReviews
  };
}

/**
 * Deterministic recommendation algorithm based on weak topics (<50% accuracy).
 * No AI or ML: purely rules-based matching.
 */
export function getTopicRecommendations(
  weakTopics: string[],
  allQuizzes: Quiz[],
  currentQuizId?: string
): RecommendedQuizItem[] {
  if (!weakTopics || weakTopics.length === 0 || !allQuizzes || allQuizzes.length === 0) {
    return [];
  }

  const recommendations: RecommendedQuizItem[] = [];
  const addedQuizIds = new Set<string>();
  if (currentQuizId) {
    addedQuizIds.add(currentQuizId);
  }

  for (const weakTopic of weakTopics) {
    const normalizedWeak = weakTopic.toLowerCase().trim();

    // Match quizzes where quiz.topic matches or quiz has questions on this topic
    for (const quiz of allQuizzes) {
      if (!quiz.isPublished || addedQuizIds.has(quiz.id)) continue;

      const matchesMainTopic = quiz.topic.toLowerCase().includes(normalizedWeak) ||
        normalizedWeak.includes(quiz.topic.toLowerCase());

      const matchesQuestionTopic = quiz.questions.some(q => 
        q.topic.toLowerCase().includes(normalizedWeak) ||
        normalizedWeak.includes(q.topic.toLowerCase())
      );

      const matchesSubject = quiz.subject.toLowerCase().includes(normalizedWeak);

      if (matchesMainTopic || matchesQuestionTopic || matchesSubject) {
        recommendations.push({
          quiz,
          matchedWeakTopic: weakTopic,
          relevanceReason: `Practice quiz recommended to improve your understanding in "${weakTopic}" (score was below 50%).`
        });
        addedQuizIds.add(quiz.id);
      }
    }
  }

  // If no direct topic match, recommend top popular published quizzes in the same general subject
  if (recommendations.length === 0) {
    const fallbackQuizzes = allQuizzes
      .filter(q => q.isPublished && !addedQuizIds.has(q.id))
      .slice(0, 2);
    for (const q of fallbackQuizzes) {
      recommendations.push({
        quiz: q,
        matchedWeakTopic: 'Core Concepts',
        relevanceReason: `Recommended fundamental practice to strengthen foundational knowledge.`
      });
      addedQuizIds.add(q.id);
    }
  }

  return recommendations;
}
