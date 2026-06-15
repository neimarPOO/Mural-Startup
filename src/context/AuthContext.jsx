import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  // Helper to fetch all teams data (nested format) from Supabase
  const fetchSupabaseTeams = async () => {
    if (!isSupabaseConfigured) return;
    try {
      setLoading(true);
      const { data: dbTeams, error: teamsError } = await supabase
        .from('teams')
        .select('*');

      if (teamsError) throw teamsError;

      let dbDeliverables = [];
      try {
        const { data, error } = await supabase
          .from('team_stage_deliverables')
          .select('*');
        if (!error && data) {
          dbDeliverables = data;
        }
      } catch (err) {
        console.warn("Table team_stage_deliverables may not exist yet:", err);
      }

      setDeliverables(dbDeliverables.map(d => ({
        teamId: d.team_id,
        stageId: d.stage_id,
        itemName: d.item_name,
        content: d.content,
        approved: d.approved,
        feedback: d.feedback || ''
      })));
      localStorage.setItem('mural_deliverables', JSON.stringify(dbDeliverables.map(d => ({
        teamId: d.team_id,
        stageId: d.stage_id,
        itemName: d.item_name,
        content: d.content,
        approved: d.approved,
        feedback: d.feedback || ''
      }))));

      const { data: dbStages, error: stagesError } = await supabase
        .from('stages_status')
        .select('*');

      if (stagesError) throw stagesError;

      const { data: dbLinks, error: linksError } = await supabase
        .from('links')
        .select('*');

      if (linksError) throw linksError;

      // Map tabular DB structure back to clean nested UI format
      const mappedTeams = dbTeams.map(team => {
        const stagesStatus = {};
        for (let i = 1; i <= 10; i++) {
          stagesStatus[i] = i === 1 ? 'in_progress' : 'pending';
        }
        dbStages
          .filter(s => s.team_id === team.id)
          .forEach(s => {
            stagesStatus[s.stage_id] = s.status;
          });

        const links = {};
        dbLinks
          .filter(l => l.team_id === team.id)
          .forEach(l => {
            if (!links[l.stage_id]) {
              links[l.stage_id] = [];
            }
            links[l.stage_id].push({
              id: l.id,
              title: l.title,
              url: l.url
            });
          });

        return {
          id: team.id,
          name: team.name,
          login: team.login,
          password: team.password,
          color: team.color,
          logo: team.logo,
          members: team.members || '',
          currentStage: team.current_stage,
          stagesStatus,
          links
        };
      });

      setTeams(mappedTeams);
      // Keep local storage updated as backup
      localStorage.setItem('mural_teams', JSON.stringify(mappedTeams));
    } catch (err) {
      console.error('Erro ao buscar dados do Supabase, usando fallback local:', err);
      loadLocalTeams();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalTeams = () => {
    const savedTeams = localStorage.getItem('mural_teams');
    if (savedTeams) {
      const parsed = JSON.parse(savedTeams);
      const hasMockTeams = parsed.some(t => ['alpha-tech', 'eco-bag', 'smart-school'].includes(t.id));
      if (hasMockTeams) {
        localStorage.removeItem('mural_teams');
        localStorage.removeItem('mural_deliverables');
        setTeams([]);
      } else {
        setTeams(parsed);
      }
    } else {
      setTeams([]);
    }
  };

  // Load active user and teams from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('mural_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedDeliverables = localStorage.getItem('mural_deliverables');
    if (savedDeliverables) {
      try {
        const parsed = JSON.parse(savedDeliverables);
        const teamsData = localStorage.getItem('mural_teams');
        const hasMockTeams = teamsData && JSON.parse(teamsData).some(t => ['alpha-tech', 'eco-bag', 'smart-school'].includes(t.id));
        if (hasMockTeams) {
          localStorage.removeItem('mural_deliverables');
        } else {
          setDeliverables(parsed);
        }
      } catch (e) {
        setDeliverables([]);
      }
    }

    if (isSupabaseConfigured) {
      fetchSupabaseTeams();
    } else {
      loadLocalTeams();
    }
  }, []);

  // Trigger confetti effect helper
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  const login = (username, password) => {
    const lowerUsername = username.trim().toLowerCase();
    
    // Check Admin login
    if (lowerUsername === 'admin' && password === 'escola2026') {
      const adminUser = { role: 'admin', name: 'Administrador' };
      setUser(adminUser);
      localStorage.setItem('mural_user', JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    // Check Team logins
    const foundTeam = teams.find(t => t.login === lowerUsername && t.password === password);
    if (foundTeam) {
      const teamUser = {
        role: 'team',
        id: foundTeam.id,
        name: foundTeam.name,
        color: foundTeam.color
      };
      setUser(teamUser);
      localStorage.setItem('mural_user', JSON.stringify(teamUser));
      return { success: true, user: teamUser };
    }

    // Also support checking newly added team passwords in case they don't have the local object state synced immediately
    const localTeams = JSON.parse(localStorage.getItem('mural_teams') || '[]');
    const foundLocalTeam = localTeams.find(t => t.login === lowerUsername && t.password === password);
    if (foundLocalTeam) {
      const teamUser = {
        role: 'team',
        id: foundLocalTeam.id,
        name: foundLocalTeam.name,
        color: foundLocalTeam.color
      };
      setUser(teamUser);
      localStorage.setItem('mural_user', JSON.stringify(teamUser));
      return { success: true, user: teamUser };
    }

    return { success: false, error: 'Credenciais inválidas. Verifique usuário e senha.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mural_user');
  };

  const addTeam = async (newTeamData) => {
    const defaultStatuses = {};
    const statusesToInsert = [];
    for (let i = 1; i <= 10; i++) {
      const status = i === 1 ? 'in_progress' : 'pending';
      defaultStatuses[i] = status;
      statusesToInsert.push({ stage_id: i, status });
    }

    const teamId = newTeamData.name.toLowerCase().replace(/\s+/g, '-');
    const fallbackLogo = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="${newTeamData.color}"/><text x="50%" y="55%" font-family="sans-serif" font-weight="bold" font-size="45" fill="white" dominant-baseline="middle" text-anchor="middle">${newTeamData.name.substring(0, 2).toUpperCase()}</text></svg>`
    )}`;

    const newTeam = {
      id: teamId,
      name: newTeamData.name,
      login: newTeamData.name.toLowerCase().replace(/\s+/g, ''),
      password: newTeamData.password,
      color: newTeamData.color,
      logo: newTeamData.logo || fallbackLogo,
      members: newTeamData.members || '',
      currentStage: 1,
      stagesStatus: defaultStatuses,
      links: {}
    };

    if (isSupabaseConfigured) {
      try {
        const { error: teamErr } = await supabase
          .from('teams')
          .insert([{
            id: teamId,
            name: newTeamData.name,
            login: newTeam.login,
            password: newTeamData.password,
            color: newTeamData.color,
            logo: newTeam.logo,
            members: newTeam.members,
            current_stage: 1
          }]);
        if (teamErr) throw teamErr;

        const { error: stagesErr } = await supabase
          .from('stages_status')
          .insert(statusesToInsert.map(s => ({ ...s, team_id: teamId })));
        if (stagesErr) throw stagesErr;

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao adicionar equipe no Supabase, usando local:', err);
        const updatedTeams = [...teams, newTeam];
        setTeams(updatedTeams);
        localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
      }
    } else {
      const updatedTeams = [...teams, newTeam];
      setTeams(updatedTeams);
      localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
    }
    
    // Trigger celebratory confetti when team registers
    triggerConfetti();
  };

  const updateTeamStage = async (teamId, stageId, status) => {
    const stageNum = parseInt(stageId);
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const newStagesStatus = { ...team.stagesStatus, [stageNum]: status };
    
    let inProgressStage = null;
    let highestCompleted = 0;
    
    for (let i = 1; i <= 10; i++) {
      if (newStagesStatus[i] === 'in_progress') {
        inProgressStage = i;
      } else if (newStagesStatus[i] === 'completed') {
        highestCompleted = i;
      }
    }

    let newCurrentStage = 1;
    if (inProgressStage !== null) {
      newCurrentStage = inProgressStage;
    } else {
      newCurrentStage = Math.min(highestCompleted + 1, 10);
    }

    if (status === 'completed' && team.stagesStatus[stageNum] !== 'completed') {
      triggerConfetti();
    }

    if (isSupabaseConfigured) {
      try {
        const { error: statusErr } = await supabase
          .from('stages_status')
          .upsert({ team_id: teamId, stage_id: stageNum, status }, { onConflict: 'team_id,stage_id' });
        if (statusErr) throw statusErr;

        const { error: teamErr } = await supabase
          .from('teams')
          .update({ current_stage: newCurrentStage })
          .eq('id', teamId);
        if (teamErr) throw teamErr;

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao atualizar etapa no Supabase, usando local:', err);
        const updatedTeams = teams.map(t => {
          if (t.id === teamId) {
            return {
              ...t,
              stagesStatus: newStagesStatus,
              currentStage: newCurrentStage
            };
          }
          return t;
        });
        setTeams(updatedTeams);
        localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
      }
    } else {
      const updatedTeams = teams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            stagesStatus: newStagesStatus,
            currentStage: newCurrentStage
          };
        }
        return t;
      });
      setTeams(updatedTeams);
      localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
    }
  };

  const updateTeamLinks = async (teamId, stageId, linksArray) => {
    if (isSupabaseConfigured) {
      try {
        const { error: deleteErr } = await supabase
          .from('links')
          .delete()
          .eq('team_id', teamId)
          .eq('stage_id', parseInt(stageId));
        if (deleteErr) throw deleteErr;

        if (linksArray.length > 0) {
          const { error: insertErr } = await supabase
            .from('links')
            .insert(linksArray.map(l => ({
              id: l.id,
              team_id: teamId,
              stage_id: parseInt(stageId),
              title: l.title,
              url: l.url
            })));
          if (insertErr) throw insertErr;
        }

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao atualizar links no Supabase, usando local:', err);
        const updatedTeams = teams.map(t => {
          if (t.id === teamId) {
            return {
              ...t,
              links: {
                ...t.links,
                [stageId]: linksArray
              }
            };
          }
          return t;
        });
        setTeams(updatedTeams);
        localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
      }
    } else {
      const updatedTeams = teams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            links: {
              ...t.links,
              [stageId]: linksArray
            }
          };
        }
        return t;
      });
      setTeams(updatedTeams);
      localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
    }
  };

  const updateTeam = async (teamId, updatedTeamData) => {
    const fallbackLogo = `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="${updatedTeamData.color}"/><text x="50%" y="55%" font-family="sans-serif" font-weight="bold" font-size="45" fill="white" dominant-baseline="middle" text-anchor="middle">${updatedTeamData.name.substring(0, 2).toUpperCase()}</text></svg>`
    )}`;

    const newLogin = updatedTeamData.name.toLowerCase().replace(/\s+/g, '');
    const finalLogo = updatedTeamData.logo || fallbackLogo;

    if (user && user.role === 'team' && user.id === teamId) {
      const updatedUser = {
        ...user,
        name: updatedTeamData.name,
        color: updatedTeamData.color,
        members: updatedTeamData.members || ''
      };
      setUser(updatedUser);
      localStorage.setItem('mural_user', JSON.stringify(updatedUser));
    }

    if (isSupabaseConfigured) {
      try {
        const { error: teamErr } = await supabase
          .from('teams')
          .update({
            name: updatedTeamData.name.trim(),
            login: newLogin,
            password: updatedTeamData.password.trim(),
            color: updatedTeamData.color,
            logo: finalLogo,
            members: updatedTeamData.members ? updatedTeamData.members.trim() : ''
          })
          .eq('id', teamId);
        if (teamErr) throw teamErr;

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao atualizar equipe no Supabase, usando local:', err);
        const updatedTeams = teams.map(t => {
          if (t.id === teamId) {
            return {
              ...t,
              name: updatedTeamData.name,
              login: newLogin,
              password: updatedTeamData.password,
              color: updatedTeamData.color,
              logo: finalLogo,
              members: updatedTeamData.members || ''
            };
          }
          return t;
        });
        setTeams(updatedTeams);
        localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
      }
    } else {
      const updatedTeams = teams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            name: updatedTeamData.name,
            login: newLogin,
            password: updatedTeamData.password,
            color: updatedTeamData.color,
            logo: finalLogo,
            members: updatedTeamData.members || ''
          };
        }
        return t;
      });
      setTeams(updatedTeams);
      localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
    }
  };

  const deleteTeam = async (teamId) => {
    if (user && user.role === 'team' && user.id === teamId) {
      logout();
    }

    if (isSupabaseConfigured) {
      try {
        const { error: deleteErr } = await supabase
          .from('teams')
          .delete()
          .eq('id', teamId);
        if (deleteErr) throw deleteErr;

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao deletar equipe no Supabase, usando local:', err);
        const updatedTeams = teams.filter(t => t.id !== teamId);
        setTeams(updatedTeams);
        localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
      }
    } else {
      const updatedTeams = teams.filter(t => t.id !== teamId);
      setTeams(updatedTeams);
      localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
    }
  };

  const saveDeliverable = async (teamId, stageId, itemName, content) => {
    const existing = deliverables.find(d => d.teamId === teamId && d.stageId === parseInt(stageId) && d.itemName === itemName);
    const feedback = existing ? (existing.feedback || '') : '';

    const newDeliverable = {
      teamId,
      stageId: parseInt(stageId),
      itemName,
      content,
      approved: false,
      feedback
    };

    setDeliverables(prev => {
      const filtered = prev.filter(d => !(d.teamId === teamId && d.stageId === parseInt(stageId) && d.itemName === itemName));
      const next = [...filtered, newDeliverable];
      localStorage.setItem('mural_deliverables', JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('team_stage_deliverables')
          .upsert({
            team_id: teamId,
            stage_id: parseInt(stageId),
            item_name: itemName,
            content: content,
            approved: false,
            feedback: feedback,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Erro ao salvar entregável no Supabase:', err);
      }
    }
  };

  const approveDeliverable = async (teamId, stageId, itemName, approvedStatus) => {
    const existing = deliverables.find(d => d.teamId === teamId && d.stageId === parseInt(stageId) && d.itemName === itemName);
    const content = existing ? existing.content : '';
    const feedback = existing ? (existing.feedback || '') : '';

    setDeliverables(prev => {
      const next = prev.map(d => {
        if (d.teamId === teamId && d.stageId === parseInt(stageId) && d.itemName === itemName) {
          return { ...d, approved: approvedStatus };
        }
        return d;
      });
      localStorage.setItem('mural_deliverables', JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('team_stage_deliverables')
          .upsert({
            team_id: teamId,
            stage_id: parseInt(stageId),
            item_name: itemName,
            content: content,
            approved: approvedStatus,
            feedback: feedback,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Erro ao aprovar entregável no Supabase:', err);
      }
    }
  };

  const saveFeedback = async (teamId, stageId, itemName, feedbackText) => {
    const existing = deliverables.find(d => d.teamId === teamId && d.stageId === parseInt(stageId) && d.itemName === itemName);
    const content = existing ? existing.content : '';
    const approved = existing ? existing.approved : false;

    const newDeliverable = {
      teamId,
      stageId: parseInt(stageId),
      itemName,
      content,
      approved,
      feedback: feedbackText
    };

    setDeliverables(prev => {
      const filtered = prev.filter(d => !(d.teamId === teamId && d.stageId === parseInt(stageId) && d.itemName === itemName));
      const next = [...filtered, newDeliverable];
      localStorage.setItem('mural_deliverables', JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('team_stage_deliverables')
          .upsert({
            team_id: teamId,
            stage_id: parseInt(stageId),
            item_name: itemName,
            content: content,
            approved: approved,
            feedback: feedbackText,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.error('Erro ao salvar feedback no Supabase:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      teams,
      deliverables,
      login,
      logout,
      addTeam,
      updateTeam,
      updateTeamStage,
      updateTeamLinks,
      deleteTeam,
      saveDeliverable,
      approveDeliverable,
      saveFeedback,
      showConfetti,
      triggerConfetti
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
