import { createClient } from "@supabase/supabase-js";

const VITE_SUPABASE_URL = "https://vrpcqzzvqughuewfuphw.supabase.co";
const VITE_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycGNxenp2cXVnaHVld2Z1cGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MDk5MTEsImV4cCI6MjA3MDM4NTkxMX0.ute99iz4fFykI5m4CIP-meseCVjqJMVyXEe9wjUYdII";

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function testAssessmentSave(testRun) {
  console.log(`\n=== TEST RUN ${testRun} ===`);

  try {
    // Sign up a test user
    console.log(`${testRun}a. Creating test user...`);
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}_${testRun}@example.com`;
    const testPassword = "Test@1234567";

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error(`✗ Sign up failed:`, signUpError.message);
      return false;
    }

    if (!authData.user) {
      console.error(`✗ No user returned from sign up`);
      return false;
    }

    const userId = authData.user.id;
    console.log(`✓ User created: ${userId}\n`);

    // Create a test assessment object
    console.log(`${testRun}b. Creating test assessment...`);
    const testAssessment = {
      userId: userId,
      completedAt: new Date(),
      scores: {
        category1: 85,
        category2: 92,
        category3: 78,
      },
      recommendedCareers: ["Software Engineer", "Data Scientist", "Product Manager"],
      mlPrediction: "Software Engineer",
      backgroundInfo: {
        userType: "professional",
        details: {
          jobTitle: "Senior Developer",
          yearsExperience: "5+",
        },
      },
      responses: [
        {
          layerId: "layer1",
          categoryId: "cat1",
          questionId: "q1",
          questionText: "Question 1 text",
          response: 4,
        },
        {
          layerId: "layer2",
          categoryId: "cat2",
          questionId: "q2",
          questionText: "Question 2 text",
          response: 5,
        },
        {
          layerId: "layer3",
          categoryId: "cat3",
          questionId: "q3",
          questionText: "Question 3 text",
          response: 3,
        },
      ],
    };

    // Save assessment
    console.log(`${testRun}c. Saving assessment to database...`);

    // Create assessment record
    const { data: assessmentData, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        user_id: userId,
        completed_at: testAssessment.completedAt.toISOString(),
        scores: testAssessment.scores,
        recommended_careers: testAssessment.recommendedCareers,
        ml_prediction: testAssessment.mlPrediction,
        background_info: testAssessment.backgroundInfo,
        status: "completed",
      })
      .select("*")
      .single();

    if (assessmentError) {
      console.error(`✗ Assessment save failed:`, assessmentError.message);
      console.error("Details:", assessmentError);
      return false;
    }

    if (!assessmentData) {
      console.error(`✗ No assessment data returned`);
      return false;
    }

    console.log(`✓ Assessment saved with ID: ${assessmentData.id}\n`);

    // Save responses
    console.log(`${testRun}d. Saving assessment responses...`);
    const responsesToInsert = testAssessment.responses.map((response) => ({
      assessment_id: assessmentData.id,
      question_id: response.questionId,
      question_text: response.questionText,
      response_value: response.response,
      category_id: response.categoryId,
      layer_number: parseInt(response.layerId.replace("layer", ""), 10),
    }));

    const { error: responsesError } = await supabase
      .from("assessment_responses")
      .insert(responsesToInsert);

    if (responsesError) {
      console.error(`✗ Responses save failed:`, responsesError.message);
      return false;
    }

    console.log(`✓ ${responsesToInsert.length} responses saved\n`);

    // Verify data was saved
    console.log(`${testRun}e. Verifying saved data...`);
    const { data: verifyAssessment, error: verifyError } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentData.id)
      .single();

    if (verifyError) {
      console.error(`✗ Verification failed:`, verifyError.message);
      return false;
    }

    console.log(`✓ Assessment verified:`, {
      id: verifyAssessment.id,
      status: verifyAssessment.status,
      background_info: verifyAssessment.background_info,
    });

    // Verify responses
    const { data: verifyResponses, error: verifyResponsesError } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("assessment_id", assessmentData.id);

    if (verifyResponsesError) {
      console.error(`✗ Response verification failed:`, verifyResponsesError.message);
      return false;
    }

    console.log(`✓ Responses verified: ${verifyResponses.length} responses found\n`);

    console.log(`✓ TEST RUN ${testRun} PASSED`);
    return true;
  } catch (error) {
    console.error(`✗ TEST RUN ${testRun} FAILED:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log("=== DATABASE SAVE TEST (3 RUNS) ===");
  const results = [];

  for (let i = 1; i <= 3; i++) {
    const success = await testAssessmentSave(i);
    results.push(success);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n=== TEST SUMMARY ===");
  console.log(`Test Run 1: ${results[0] ? "✓ PASSED" : "✗ FAILED"}`);
  console.log(`Test Run 2: ${results[1] ? "✓ PASSED" : "✗ FAILED"}`);
  console.log(`Test Run 3: ${results[2] ? "✓ PASSED" : "✗ FAILED"}`);
  console.log(`Overall: ${results.every((r) => r) ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED"}`);
}

runTests().catch(console.error);
