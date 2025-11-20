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

// =======================
// Get all quizzes
// =======================
export async function getAllQuizzes() {
  try {
    const quizzesRef = collection(db, QUIZZES_COLLECTION);
    const q = query(quizzesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw new Error("Failed to fetch quizzes");
  }
}

// =======================
// Get quiz by slug
// =======================
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

// =======================
// Get quiz by id
// =======================
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

// =======================
// Create Quiz
// =======================
export async function createQuiz(quizData) {
  try {
    const existingQuiz = await getQuizBySlug(quizData.slug);
    if (existingQuiz) {
      throw new Error("A quiz with this slug already exists");
    }

    const cleanedData = {
      slug: quizData.slug,
      title: quizData.title,
      description: quizData.description,
      type: quizData.type,
      questions: quizData.questions.map((q) => ({
        question: q.question,
        image: q.image?.trim() || "",   // ⬅ ALWAYS SAVE IMAGE KEY
        options: q.options,
        correctIndex: q.correctIndex,
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const quizzesRef = collection(db, QUIZZES_COLLECTION);
    const docRef = await addDoc(quizzesRef, cleanedData);

    return {
      id: docRef.id,
      ...cleanedData,
    };
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
}

// =======================
// Update Quiz
// =======================
export async function updateQuiz(id, quizData) {
  try {
    if (quizData.slug) {
      const existingQuiz = await getQuizBySlug(quizData.slug);
      if (existingQuiz && existingQuiz.id !== id) {
        throw new Error("A quiz with this slug already exists");
      }
    }

    const cleanedData = {
      slug: quizData.slug,
      title: quizData.title,
      description: quizData.description,
      type: quizData.type,
      questions: quizData.questions.map((q) => ({
        question: q.question,
        image: q.image?.trim() || "",   // ⬅ ALWAYS SAVE IMAGE KEY
        options: q.options,
        correctIndex: q.correctIndex,
      })),
      updatedAt: serverTimestamp(),
    };

    const quizRef = doc(db, QUIZZES_COLLECTION, id);
    await updateDoc(quizRef, cleanedData);

    return { id, ...cleanedData };
  } catch (error) {
    console.error("Error updating quiz:", error);
    throw error;
  }
}

// =======================
// Delete Quiz
// =======================
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

// =======================
// Validate Quiz Input
// =======================
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

  if (!["text", "image/Video", "mixed"].includes(quizData.type)) {
    errors.push("Type must be 'text', 'image/Video', or 'mixed'");
  }

  quizData.questions?.forEach((q, index) => {
    if (!q.question || q.question.trim().length === 0) {
      errors.push(`Question ${index + 1}: Question text is required`);
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`Question ${index + 1}: At least 2 options are required`);
    }

    if (
      typeof q.correctIndex !== "number" ||
      q.correctIndex < 0 ||
      q.correctIndex >= q.options?.length
    ) {
      errors.push(`Question ${index + 1}: Valid correct answer index is required`);
    }

    if (quizData.type === "image" && !q.image?.trim()) {
      errors.push(`Question ${index + 1}: Image is required for image quiz`);
    }
  });

  return errors;
}

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
