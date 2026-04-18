import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db, auth, googleProvider } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

export type Role = 'STUDENT' | 'PROFESSOR';
export type PhaseStatus = 'LOCKED' | 'TODO' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  blockReason?: string;
}

export interface Phase {
  status: PhaseStatus;
  data: any;
  feedback?: string;
  submittedAt?: number;
}

export interface Project {
  id: string;
  token: string;
  name: string;
  students: string[];
  memberIds: string[];
  phases: {
    1: Phase; 2: Phase; 3: Phase; 4: Phase; 5: Phase; 6: Phase; 7: Phase; 8: Phase;
  };
  kanban: KanbanCard[]; // Merged locally by listener
  lastInteraction: number;
}

interface AppState {
  currentUser: { uid: string; name: string; role: Role; projectId?: string } | null;
  projects: Record<string, Project>;
  authReady: boolean;
  
  _syncUser: (user: AppState['currentUser']) => void;
  _syncProjects: (projects: Record<string, Project>) => void;
  _setAuthReady: (ready: boolean) => void;

  login: (name: string, role: Role) => Promise<void>; // Retained for fallback/Google if needed
  loginEmail: (email: string, password: string) => Promise<void>;
  signupEmail: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  createProject: (name: string, studentName: string) => Promise<void>;
  joinProject: (token: string, studentName: string) => Promise<void>;
  submitPhase: (projectId: string, phaseNum: 1|2|3|4|5|6|7|8, data: any) => Promise<void>;
  evaluatePhase: (projectId: string, phaseNum: 1|2|3|4|5|6|7|8, approved: boolean, feedback?: string) => Promise<void>;
  moveCard: (projectId: string, cardId: string, status: KanbanCard['status'], blockReason?: string) => Promise<void>;
  triggerInteraction: (projectId: string) => Promise<void>;
}

const generateToken = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const initialPhases = () => ({
  1: { status: 'TODO' as PhaseStatus, data: {} },
  2: { status: 'LOCKED' as PhaseStatus, data: {} },
  3: { status: 'LOCKED' as PhaseStatus, data: {} },
  4: { status: 'LOCKED' as PhaseStatus, data: {} },
  5: { status: 'LOCKED' as PhaseStatus, data: {} },
  6: { status: 'LOCKED' as PhaseStatus, data: {} },
  7: { status: 'LOCKED' as PhaseStatus, data: {} },
  8: { status: 'LOCKED' as PhaseStatus, data: {} },
});

export const useStore = create<AppState>()((set, get) => ({
  currentUser: null,
  projects: {},
  authReady: false,

  _syncUser: (user) => set({ currentUser: user }),
  _syncProjects: (projects) => set({ projects }),
  _setAuthReady: (ready) => set({ authReady: ready }),

  login: async (name, role) => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const uid = result.user.uid;
      
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name,
          role,
          projectId: ''
        });
      }
    } catch (err: any) {
      console.error(err);
      alert('Login error: ' + err.message);
    }
  },

  loginEmail: async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message);
    }
  },

  signupEmail: async (name, email, password, role) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      
      const uid = result.user.uid;
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        name,
        role,
        projectId: '' // empty until they create/join
      });
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message); // throw to let component know
    }
  },

  logout: async () => {
    await signOut(auth);
  },

  createProject: async (name, studentName) => {
    const state = get();
    if (!state.currentUser || state.currentUser.role !== 'STUDENT') return;
    
    const id = uuidv4();
    const token = generateToken();
    const uid = state.currentUser.uid;

    const projectRef = doc(db, 'projects', id);
    await setDoc(projectRef, {
      token,
      name,
      students: [studentName],
      memberIds: [uid],
      lastInteraction: Date.now(),
      phases: initialPhases()
    });

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { projectId: id });
  },

  joinProject: async (token, studentName) => {
    const state = get();
    if (!state.currentUser || state.currentUser.role !== 'STUDENT') return;
    
    const q = query(collection(db, 'projects'), where('token', '==', token));
    const snaps = await getDocs(q);
    if (snaps.empty) {
      alert("Invalid Token");
      return;
    }
    
    const projDoc = snaps.docs[0];
    const uid = state.currentUser.uid;
    
    const oldStudents = projDoc.data().students || [];
    const oldMembers = projDoc.data().memberIds || [];
    
    await updateDoc(projDoc.ref, {
      students: [...oldStudents, studentName],
      memberIds: [...oldMembers, uid],
      lastInteraction: Date.now()
    });

    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { projectId: projDoc.id });
  },

  submitPhase: async (projectId, phaseNum, data) => {
    const project = get().projects[projectId];
    if (!project) return;
    
    const newPhases = { ...project.phases };
    newPhases[phaseNum] = { ...newPhases[phaseNum], status: 'PENDING', data, submittedAt: Date.now() };
    
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, { 
      phases: newPhases,
      lastInteraction: Date.now()
    });
  },

  evaluatePhase: async (projectId, phaseNum, approved, feedback) => {
    const project = get().projects[projectId];
    if (!project) return;

    const newPhases = { ...project.phases };

    if (approved) {
      newPhases[phaseNum] = { ...newPhases[phaseNum], status: 'APPROVED', feedback: '' };
      const nextPhaseNum = (phaseNum + 1) as keyof Project['phases'];
      if (newPhases[nextPhaseNum]) {
         newPhases[nextPhaseNum].status = 'TODO';
      }

      // Kanban generation via Batch Write
      const kanbanBatch = writeBatch(db);
      if (phaseNum === 3 && newPhases[3].data?.funcionais) {
        const reqs = newPhases[3].data.funcionais;
        const currentCards = project.kanban || [];
        reqs.forEach((req: any) => {
          if (!currentCards.find(c => c.id === req.id)) { // Prevent duplicate generation if somehow called twice
            const cardId = req.id || uuidv4();
            const cardRef = doc(db, `projects/${projectId}/cards`, cardId);
            kanbanBatch.set(cardRef, {
              title: req.title || 'Requisito',
              description: `${req.description}\n\nPrioridade: ${req.priority}`,
              status: 'BACKLOG',
              blockReason: ''
            });
          }
        });
      }
      
      const projectRef = doc(db, 'projects', projectId);
      kanbanBatch.update(projectRef, {
        phases: newPhases,
        lastInteraction: Date.now()
      });
      await kanbanBatch.commit();
      
    } else {
      newPhases[phaseNum] = { ...newPhases[phaseNum], status: 'REJECTED', feedback };
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        phases: newPhases,
        lastInteraction: Date.now()
      });
    }
  },

  moveCard: async (projectId, cardId, status, blockReason) => {
    const cardRef = doc(db, `projects/${projectId}/cards`, cardId);
    await updateDoc(cardRef, {
      status,
      blockReason: status === 'BLOCKED' ? (blockReason || '') : ''
    });
    const projRef = doc(db, 'projects', projectId);
    await updateDoc(projRef, { lastInteraction: Date.now() });
  },

  triggerInteraction: async (projectId) => {
    const projRef = doc(db, 'projects', projectId);
    await updateDoc(projRef, { lastInteraction: Date.now() });
  }
}));
