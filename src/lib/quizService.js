import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const QUIZZES_COLLECTION = "quizzes";

/**
 * Firestore Data Structure:
 * quizzes/{quizId}
 * {
 *   slug: string (unique, url-safe identifier)
 *   title: string
 *   description: string
 *   type: 'text' | 'image' | 'mixed'
 *   questions: [
 *     {
 *       question: string
 *       image: string (optional, external URL)
 *       options: string[]
 *       correctIndex: number
 *     }
 *   ]
 *   createdAt: timestamp
 *   updatedAt: timestamp
 * }
 */

// Get all quizzes
export async function getAllQuizzes() {
  try {
    const quizzesRef = collection(db, QUIZZES_COLLECTION);
    const q = query(quizzesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw new Error("Failed to fetch quizzes");
  }
}

// Get quiz by slug
export async function getQuizBySlug(slug) {
  try {
    const quizzesRef = collection(db, QUIZZES_COLLECTION);
    const q = query(quizzesRef, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw new Error("Failed to fetch quiz");
  }
}

// Get quiz by ID
export async function getQuizById(id) {
  try {
    const quizRef = doc(db, QUIZZES_COLLECTION, id);
    const quizDoc = await getDoc(quizRef);
    
    if (!quizDoc.exists()) {
      return null;
    }
    
    return {
      id: quizDoc.id,
      ...quizDoc.data(),
    };
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw new Error("Failed to fetch quiz");
  }
}

// Create new quiz
export async function createQuiz(quizData) {
  try {
    // Check if slug already exists
    const existingQuiz = await getQuizBySlug(quizData.slug);
    if (existingQuiz) {
      throw new Error("A quiz with this slug already exists");
    }
    
    // Clean the quiz data - remove undefined values
    const cleanedData = {
      slug: quizData.slug,
      title: quizData.title,
      description: quizData.description,
      type: quizData.type,
      questions: quizData.questions.map((q) => {
        const cleanedQuestion = {
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
        };
        // Only add image if it exists and is not empty
        if (q.image && q.image.trim()) {
          cleanedQuestion.image = q.image;
        }
        return cleanedQuestion;
      }),
    };
    
    const quizzesRef = collection(db, QUIZZES_COLLECTION);
    const docRef = await addDoc(quizzesRef, {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return {
      id: docRef.id,
      ...cleanedData,
    };
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
}

// Update existing quiz
export async function updateQuiz(id, quizData) {
  try {
    // If slug is being changed, check if new slug already exists
    if (quizData.slug) {
      const existingQuiz = await getQuizBySlug(quizData.slug);
      if (existingQuiz && existingQuiz.id !== id) {
        throw new Error("A quiz with this slug already exists");
      }
    }
    
    // Clean the quiz data - remove undefined values
    const cleanedData = {
      slug: quizData.slug,
      title: quizData.title,
      description: quizData.description,
      type: quizData.type,
      questions: quizData.questions.map((q) => {
        const cleanedQuestion = {
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
        };
        // Only add image if it exists and is not empty
        if (q.image && q.image.trim()) {
          cleanedQuestion.image = q.image;
        }
        return cleanedQuestion;
      }),
    };
    
    const quizRef = doc(db, QUIZZES_COLLECTION, id);
    await updateDoc(quizRef, {
      ...cleanedData,
      updatedAt: serverTimestamp(),
    });
    
    return {
      id,
      ...cleanedData,
    };
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
}

// Delete quiz
export async function deleteQuiz(id) {
  try {
    const quizRef = doc(db, QUIZZES_COLLECTION, id);
    await deleteDoc(quizRef);
    return true;
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw new Error("Failed to delete quiz");
  }
}

// Validate quiz data
export function validateQuizData(quizData) {
  const errors = [];
  
  if (!quizData.slug || !/^[a-z0-9-]+$/.test(quizData.slug)) {
    errors.push("Slug must be lowercase letters, numbers, and hyphens only");
  }
  
  if (!quizData.title || quizData.title.trim().length === 0) {
    errors.push("Title is required");
  }
  
  if (!quizData.description || quizData.description.trim().length === 0) {
    errors.push("Description is required");
  }
  
  if (!["text", "image", "mixed"].includes(quizData.type)) {
    errors.push("Type must be 'text', 'image', or 'mixed'");
  }
  

  
  quizData.questions?.forEach((q, index) => {
    if (!q.question || q.question.trim().length === 0) {
      errors.push(`Question ${index + 1}: Question text is required`);
    }
    
    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`Question ${index + 1}: At least 2 options are required`);
    }
    
    if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex >= q.options?.length) {
      errors.push(`Question ${index + 1}: Valid correct answer index is required`);
    }
    
    // Validate image URL if provided
    if (q.image && !isValidUrl(q.image)) {
      errors.push(`Question ${index + 1}: Invalid image URL`);
    }
  });
  
  return errors;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
