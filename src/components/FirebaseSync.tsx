import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { onSnapshot, collection, query, doc, getDocs, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useStore, Project, KanbanCard } from '../store';

export function FirebaseSync({ children }: { children: React.ReactNode }) {
  const _syncUser = useStore(state => state._syncUser);
  const _syncProjects = useStore(state => state._syncProjects);
  const _setAuthReady = useStore(state => state._setAuthReady);
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role and projectId
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          _syncUser({
            uid: user.uid,
            name: data.name,
            role: data.role,
            projectId: data.projectId,
          });
        } else {
          // Temporarily set them without full DB sync (happens when signing up)
          _syncUser({ uid: user.uid, name: user.displayName || 'Novo Usuário', role: 'STUDENT', projectId: '' });
        }
      } else {
        _syncUser(null);
      }
      _setAuthReady(true);
    });

    return () => unsubAuth();
  }, []);

  // Sync User Document changes (like joining a project)
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubUser = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        useStore.setState(prev => ({
          currentUser: prev.currentUser ? {
            ...prev.currentUser,
            name: data.name,
            role: data.role,
            projectId: data.projectId
          } : prev.currentUser
        }));
      }
    });
    return () => unsubUser();
  }, [currentUser?.uid]);

  // Sync Projects
  useEffect(() => {
    if (!currentUser) {
      _syncProjects({});
      return;
    }

    let q;
    if (currentUser.role === 'PROFESSOR') {
      q = collection(db, 'projects'); // Real app would limit to active semester/turma
    } else if (currentUser.projectId) {
      // Temporary trick: query project by token or just listen to the specific doc
      // Wait, firestore rules restrict students to projects where they are in memberIds
    }
    
    let unsubProjects = () => {};
    let unsubCards: Record<string, () => void> = {};

    const projectsObj: Record<string, Project> = {};
    
    // Helper to setup card listener for a project
    const attachCardsListener = (projectId: string) => {
      if (unsubCards[projectId]) return;
      unsubCards[projectId] = onSnapshot(collection(db, `projects/${projectId}/cards`), (cardSnaps) => {
        const cards: KanbanCard[] = [];
        cardSnaps.forEach(c => cards.push({ id: c.id, ...c.data() } as KanbanCard));
        useStore.setState(prev => {
          if (!prev.projects[projectId]) return prev;
          return {
            projects: {
              ...prev.projects,
              [projectId]: { ...prev.projects[projectId], kanban: cards }
            }
          };
        });
      }, (err) => {
        console.error(`Erro ao sincronizar cards do projeto ${projectId}:`, err);
      });
    };

    if (currentUser.role === 'PROFESSOR') {
      unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
        const newProjects = { ...useStore.getState().projects };
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const old = newProjects[docSnap.id] || { kanban: [] };
          newProjects[docSnap.id] = { id: docSnap.id, phases: {}, ...data, kanban: old.kanban } as Project;
          attachCardsListener(docSnap.id);
        });
        _syncProjects(newProjects);
      }, (err) => {
        console.error("Erro ao sincronizar projetos para o professor:", err);
      });
    } else if (currentUser.projectId) {
      unsubProjects = onSnapshot(doc(db, 'projects', currentUser.projectId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const newProjects = { ...useStore.getState().projects };
          const old = newProjects[docSnap.id] || { kanban: [] };
          newProjects[docSnap.id] = { id: docSnap.id, phases: {}, ...data, kanban: old.kanban } as Project;
          attachCardsListener(docSnap.id);
          _syncProjects(newProjects);
        }
      }, (err) => {
        console.error("Erro ao sincronizar projeto do aluno:", err);
      });
    }

    return () => {
      unsubProjects();
      Object.values(unsubCards).forEach(un => un());
    };
  }, [currentUser?.uid, currentUser?.role, currentUser?.projectId]);

  return <>{children}</>;
}
