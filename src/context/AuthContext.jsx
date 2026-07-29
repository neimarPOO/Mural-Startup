import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { stages as initialStages } from '../data/stages';

const AuthContext = createContext(null);

// ATENÇÃO: Este app armazena senhas em plaintext no localStorage e no Supabase
// por ser um ambiente educacional controlado. Para produção, implemente:
// 1. Supabase Auth (autenticação gerenciada)
// 2. Hash de senhas com bcrypt via Edge Functions
// 3. Row Level Security nas tabelas
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [stageDetails, setStageDetails] = useState({}); // format: { [stageId]: ["Detail1", "Detail2"] }
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

      let dbDeliverables = undefined;
      let deliverableFetchOk = false;
      try {
        const { data, error } = await supabase
          .from('team_stage_deliverables')
          .select('*');
        if (!error && data) {
          dbDeliverables = data;
          deliverableFetchOk = true;
        }
      } catch (err) {
        console.warn("Table team_stage_deliverables may not exist yet:", err);
      }

      if (deliverableFetchOk) {
        const mapped = (dbDeliverables || []).map(d => ({
          teamId: d.team_id,
          stageId: d.stage_id,
          itemName: d.item_name,
          content: d.content,
          approved: d.approved,
          feedback: d.feedback || ''
        }));
        setDeliverables(mapped);
        localStorage.setItem('mural_deliverables', JSON.stringify(mapped));
      }

      // Fetch custom details and deleted details (only if tables exist)
      try {
        const { data: customData, error: customErr } = await supabase
          .from('custom_stage_details')
          .select('*');

        let dbDeleted = [];
        try {
          const { data: delData } = await supabase
            .from('deleted_stage_details')
            .select('*');
          if (delData) dbDeleted = delData;
        } catch (e) {
          // Table deleted_stage_details may not exist in DB yet
        }

        const localDeleted = JSON.parse(localStorage.getItem('mural_deleted_stage_details') || '{}');
        const finalStageDetails = {};

        initialStages.forEach(s => {
          const sId = s.id;
          const dbDeletedForStage = dbDeleted.filter(d => d.stage_id === sId).map(d => d.item_name.toUpperCase());
          const localDeletedForStage = (localDeleted[sId] || []).map(n => n.toUpperCase());

          const stageDeleted = Array.from(new Set([...dbDeletedForStage, ...localDeletedForStage]));

          // Seed with default initial details, excluding any deleted by Admin
          finalStageDetails[sId] = s.details.filter(item => !stageDeleted.includes(item.toUpperCase()));

          // Add custom details fetched from Supabase DB
          if (!customErr && customData && customData.length > 0) {
            customData.filter(d => d.stage_id === sId).forEach(d => {
              const itemNameUpper = d.item_name.toUpperCase();
              if (!stageDeleted.includes(itemNameUpper) && !finalStageDetails[sId].map(name => name.toUpperCase()).includes(itemNameUpper)) {
                finalStageDetails[sId].push(d.item_name);
              }
            });
          }
        });

        setStageDetails(finalStageDetails);
        localStorage.setItem('mural_stage_details', JSON.stringify(finalStageDetails));
      } catch (err) {
        console.warn("Erro ao buscar custom_stage_details/deleted_stage_details no Supabase:", err);
      }

      let dbStages = [];
      try {
        const { data, error } = await supabase
          .from('stages_status')
          .select('*');
        if (!error && data) {
          dbStages = data;
        }
      } catch (err) {
        console.warn("Table stages_status may not exist yet:", err);
      }

      let dbLinks = [];
      try {
        const { data, error } = await supabase
          .from('links')
          .select('*');
        if (!error && data) {
          dbLinks = data;
        }
      } catch (err) {
        console.warn("Table links may not exist yet:", err);
      }

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

      if (mappedTeams.length > 0) {
        setTeams(mappedTeams);
        localStorage.setItem('mural_teams', JSON.stringify(mappedTeams));
      } else {
        // Tabelas existem mas estao vazias (ex: migration recem-aplicada).
        // Preserva dados que estavam em localStorage.
        loadLocalTeams();
      }
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

    const savedStageDetails = localStorage.getItem('mural_stage_details');
    if (savedStageDetails) {
      try {
        setStageDetails(JSON.parse(savedStageDetails));
      } catch (e) {
        // Build initial object
        const baseline = {};
        initialStages.forEach(s => {
          baseline[s.id] = [...s.details];
        });
        setStageDetails(baseline);
      }
    } else {
      const baseline = {};
      initialStages.forEach(s => {
        baseline[s.id] = [...s.details];
      });
      setStageDetails(baseline);
      localStorage.setItem('mural_stage_details', JSON.stringify(baseline));
    }

    if (isSupabaseConfigured) {
      fetchSupabaseTeams();

      const channel = supabase
        .channel('public_mural_changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          fetchSupabaseTeams();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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

    // Check Admin login (from environment variables)
    const adminUsername = (import.meta.env.VITE_ADMIN_USERNAME || 'admin').toLowerCase();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!adminPassword) {
      console.warn('VITE_ADMIN_PASSWORD não configurada no .env');
    }
    if (lowerUsername === adminUsername && password === adminPassword) {
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
        alert(`Erro do Supabase: ${err.message || err.details || JSON.stringify(err)}. A equipe foi salva temporariamente apenas no seu navegador local.`);
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

        if (statusErr) {
          if (statusErr.code === '23503') {
            const { error: insertErr } = await supabase
              .from('teams')
              .insert({
                id: teamId,
                name: team.name,
                login: team.login || '',
                password: team.password || '',
                color: team.color || '#6366f1',
                logo: team.logo || '',
                members: team.members || '',
                current_stage: newCurrentStage
              });
            if (insertErr) throw insertErr;

            const { error: retryErr } = await supabase
              .from('stages_status')
              .upsert({ team_id: teamId, stage_id: stageNum, status }, { onConflict: 'team_id,stage_id' });
            if (retryErr) throw retryErr;

            const teamDeliverables = deliverables.filter(d => d.teamId === teamId);
            for (const del of teamDeliverables) {
              await supabase
                .from('team_stage_deliverables')
                .upsert({
                  team_id: del.teamId,
                  stage_id: del.stageId,
                  item_name: del.itemName,
                  content: del.content,
                  approved: del.approved,
                  feedback: del.feedback || '',
                  updated_at: new Date().toISOString()
                }, { onConflict: 'team_id,stage_id,item_name' });
            }
          } else {
            throw statusErr;
          }
        }

        const { error: teamErr } = await supabase
          .from('teams')
          .update({ current_stage: newCurrentStage })
          .eq('id', teamId);
        if (teamErr) throw teamErr;

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao atualizar etapa no Supabase, usando local:', err);
        alert(`Erro do Supabase ao atualizar etapa da equipe: ${err.message || JSON.stringify(err)}. A etapa foi salva apenas localmente.`);
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
        alert(`Erro do Supabase ao excluir equipe: ${err.message || JSON.stringify(err)}. A equipe foi removida apenas localmente.`);
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
    const stageNum = parseInt(stageId);
    const team = teams.find(t => t.id === teamId);
    const existing = deliverables.find(d => d.teamId === teamId && d.stageId === stageNum && d.itemName === itemName);
    const feedback = existing ? (existing.feedback || '') : '';

    const newDeliverable = {
      teamId,
      stageId: stageNum,
      itemName,
      content,
      approved: false,
      feedback
    };

    setDeliverables(prev => {
      const filtered = prev.filter(d => !(d.teamId === teamId && d.stageId === stageNum && d.itemName === itemName));
      const next = [...filtered, newDeliverable];
      localStorage.setItem('mural_deliverables', JSON.stringify(next));
      return next;
    });

    // Check if stage reversion is needed
    let revertStageNeeded = false;
    let newCurrentStage = team ? team.currentStage : 1;

    if (team) {
      if (team.stagesStatus[stageNum] === 'completed' || stageNum < team.currentStage) {
        revertStageNeeded = true;
      }
    }

    if (revertStageNeeded && team) {
      const newStagesStatus = { ...team.stagesStatus, [stageNum]: 'in_progress' };
      
      // Recalculate current stage based on new stagesStatus
      let inProgressStage = null;
      let highestCompleted = 0;
      for (let i = 1; i <= 10; i++) {
        if (newStagesStatus[i] === 'in_progress') {
          if (inProgressStage === null || i < inProgressStage) {
            inProgressStage = i;
          }
        } else if (newStagesStatus[i] === 'completed') {
          highestCompleted = i;
        }
      }
      if (inProgressStage !== null) {
        newCurrentStage = inProgressStage;
      } else {
        newCurrentStage = Math.min(highestCompleted + 1, 10);
      }

      // Update local state for immediate feedback
      const updatedTeams = teams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            currentStage: newCurrentStage,
            stagesStatus: newStagesStatus
          };
        }
        return t;
      });
      setTeams(updatedTeams);
      localStorage.setItem('mural_teams', JSON.stringify(updatedTeams));
    }

    if (isSupabaseConfigured) {
      try {
        const { error: delErr } = await supabase
          .from('team_stage_deliverables')
          .upsert({
            team_id: teamId,
            stage_id: stageNum,
            item_name: itemName,
            content: content,
            approved: false,
            feedback: feedback,
            updated_at: new Date().toISOString()
          }, { onConflict: 'team_id,stage_id,item_name' });

        if (delErr) {
          if (delErr.code === '23503' && team) {
            await supabase
              .from('teams')
              .upsert({
                id: teamId,
                name: team.name,
                login: team.login || '',
                password: team.password || '',
                color: team.color || '#6366f1',
                logo: team.logo || '',
                members: team.members || '',
                current_stage: team.currentStage || 1
              }, { onConflict: 'id' });

            const { error: retryErr } = await supabase
              .from('team_stage_deliverables')
              .upsert({
                team_id: teamId,
                stage_id: stageNum,
                item_name: itemName,
                content: content,
                approved: false,
                feedback: feedback,
                updated_at: new Date().toISOString()
              }, { onConflict: 'team_id,stage_id,item_name' });

            if (retryErr) throw retryErr;
          } else {
            throw delErr;
          }
        }

        // If stage needs to be reverted, update stages_status and teams in Supabase
        if (revertStageNeeded && team) {
          const { error: statusErr } = await supabase
            .from('stages_status')
            .upsert({ team_id: teamId, stage_id: stageNum, status: 'in_progress' }, { onConflict: 'team_id,stage_id' });
          if (statusErr) throw statusErr;

          const { error: teamErr } = await supabase
            .from('teams')
            .update({ current_stage: newCurrentStage })
            .eq('id', teamId);
          if (teamErr) throw teamErr;
        }

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao salvar entregável no Supabase:', err);
        alert(`Erro do Supabase ao salvar tarefa: ${err.message || JSON.stringify(err)}. A tarefa foi salva apenas localmente.`);
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
        const { error: appErr } = await supabase
          .from('team_stage_deliverables')
          .upsert({
            team_id: teamId,
            stage_id: parseInt(stageId),
            item_name: itemName,
            content: content,
            approved: approvedStatus,
            feedback: feedback,
            updated_at: new Date().toISOString()
          }, { onConflict: 'team_id,stage_id,item_name' });

        if (appErr && appErr.code === '23503') {
          const team = teams.find(t => t.id === teamId);
          if (team) {
            await supabase
              .from('teams')
              .upsert({
                id: teamId,
                name: team.name,
                login: team.login || '',
                password: team.password || '',
                color: team.color || '#6366f1',
                logo: team.logo || '',
                members: team.members || '',
                current_stage: team.currentStage || 1
              }, { onConflict: 'id' });

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
              }, { onConflict: 'team_id,stage_id,item_name' });
          }
        } else if (appErr) {
          throw appErr;
        }
      } catch (err) {
        console.error('Erro ao aprovar entregável no Supabase:', err);
        alert(`Erro do Supabase ao aprovar tarefa: ${err.message || JSON.stringify(err)}`);
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
        const { error: fbErr } = await supabase
          .from('team_stage_deliverables')
          .upsert({
            team_id: teamId,
            stage_id: parseInt(stageId),
            item_name: itemName,
            content: content,
            approved: approved,
            feedback: feedbackText,
            updated_at: new Date().toISOString()
          }, { onConflict: 'team_id,stage_id,item_name' });

        if (fbErr && fbErr.code === '23503') {
          const team = teams.find(t => t.id === teamId);
          if (team) {
            await supabase
              .from('teams')
              .upsert({
                id: teamId,
                name: team.name,
                login: team.login || '',
                password: team.password || '',
                color: team.color || '#6366f1',
                logo: team.logo || '',
                members: team.members || '',
                current_stage: team.currentStage || 1
              }, { onConflict: 'id' });

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
              }, { onConflict: 'team_id,stage_id,item_name' });
          }
        } else if (fbErr) {
          throw fbErr;
        }
      } catch (err) {
        console.error('Erro ao salvar feedback no Supabase:', err);
        alert(`Erro do Supabase ao salvar feedback: ${err.message || JSON.stringify(err)}`);
      }
    }
  };

  const addStageDetail = async (stageId, detailName) => {
    const sId = parseInt(stageId);
    const trimmed = detailName.trim();
    if (!trimmed) return;

    // Unmark from deleted if it was previously deleted
    const deletedSaved = JSON.parse(localStorage.getItem('mural_deleted_stage_details') || '{}');
    if (deletedSaved[sId]) {
      deletedSaved[sId] = deletedSaved[sId].filter(n => n.toUpperCase() !== trimmed.toUpperCase());
      localStorage.setItem('mural_deleted_stage_details', JSON.stringify(deletedSaved));
    }

    setStageDetails(prev => {
      const current = prev[sId] || [];
      if (current.map(name => name.toUpperCase()).includes(trimmed.toUpperCase())) {
        return prev;
      }
      const next = { ...prev, [sId]: [...current, trimmed] };
      localStorage.setItem('mural_stage_details', JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      try {
        // Remove from deleted_stage_details DB table if previously marked as deleted
        try {
          await supabase
            .from('deleted_stage_details')
            .delete()
            .eq('stage_id', sId)
            .eq('item_name', trimmed);
        } catch (e) {}

        let { error } = await supabase
          .from('custom_stage_details')
          .upsert([{
            stage_id: sId,
            item_name: trimmed
          }], { onConflict: 'stage_id,item_name' });

        if (error) {
          // Fallback para insert se onConflict falhar por falta de restricao UNIQUE
          const { error: insertErr } = await supabase
            .from('custom_stage_details')
            .insert([{
              stage_id: sId,
              item_name: trimmed
            }]);
          error = insertErr;
        }

        if (error && error.code !== '23505') {
          console.error('Erro do Supabase ao inserir tarefa:', error);
          alert(`Erro do Supabase ao criar tarefa: ${error.message || JSON.stringify(error)}`);
        } else {
          await fetchSupabaseTeams();
        }
      } catch (err) {
        console.error('Erro ao salvar nova legenda no Supabase:', err);
        alert(`Erro ao salvar tarefa no Supabase: ${err.message || JSON.stringify(err)}`);
      }
    }
  };

  const editStageDetail = async (stageId, oldDetailName, newDetailName) => {
    const sId = parseInt(stageId);
    const oldTrimmed = oldDetailName.trim();
    const newTrimmed = newDetailName.trim();
    if (!oldTrimmed || !newTrimmed || oldTrimmed === newTrimmed) return;

    // Mark old name as deleted so default initialStages doesn't re-inject old name
    const deletedSaved = JSON.parse(localStorage.getItem('mural_deleted_stage_details') || '{}');
    const currentDeleted = deletedSaved[sId] || [];
    if (!currentDeleted.map(n => n.toUpperCase()).includes(oldTrimmed.toUpperCase())) {
      deletedSaved[sId] = [...currentDeleted, oldTrimmed];
    }
    // Make sure new name is not in deleted list
    deletedSaved[sId] = deletedSaved[sId].filter(n => n.toUpperCase() !== newTrimmed.toUpperCase());
    localStorage.setItem('mural_deleted_stage_details', JSON.stringify(deletedSaved));

    setStageDetails(prev => {
      const current = prev[sId] || [];
      const updated = current.map(item => item.toUpperCase() === oldTrimmed.toUpperCase() ? newTrimmed : item);
      const next = { ...prev, [sId]: updated };
      localStorage.setItem('mural_stage_details', JSON.stringify(next));
      return next;
    });

    // Rename associated deliverables
    setDeliverables(prev => {
      const next = prev.map(d => {
        if (d.stageId === sId && d.itemName.toUpperCase() === oldTrimmed.toUpperCase()) {
          return { ...d, itemName: newTrimmed };
        }
        return d;
      });
      localStorage.setItem('mural_deliverables', JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      try {
        // Persist old name as deleted in deleted_stage_details table in Supabase DB
        try {
          await supabase
            .from('deleted_stage_details')
            .upsert([{ stage_id: sId, item_name: oldTrimmed }], { onConflict: 'stage_id,item_name' });
        } catch (e) {
          try {
            await supabase
              .from('deleted_stage_details')
              .insert([{ stage_id: sId, item_name: oldTrimmed }]);
          } catch (e2) {}
        }

        // Try updating custom detail in DB
        const { data: updatedDetails, error: err1 } = await supabase
          .from('custom_stage_details')
          .update({ item_name: newTrimmed })
          .eq('stage_id', sId)
          .eq('item_name', oldTrimmed)
          .select();

        if (err1 || !updatedDetails || updatedDetails.length === 0) {
          // If it was a default stage detail or update returned 0 rows, insert newTrimmed into custom_stage_details
          await supabase
            .from('custom_stage_details')
            .upsert([{ stage_id: sId, item_name: newTrimmed }], { onConflict: 'stage_id,item_name' });
        }

        // Update deliverables in DB
        await supabase
          .from('team_stage_deliverables')
          .update({ item_name: newTrimmed })
          .eq('stage_id', sId)
          .eq('item_name', oldTrimmed);

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao editar tarefa no Supabase:', err);
      }
    }
  };

  const deleteStageDetail = async (stageId, detailName) => {
    const sId = parseInt(stageId);
    const trimmed = detailName.trim();
    if (!trimmed) return;

    // Mark detail as deleted locally so fetchSupabaseTeams will filter it out from initialStages
    const deletedSaved = JSON.parse(localStorage.getItem('mural_deleted_stage_details') || '{}');
    const currentDeleted = deletedSaved[sId] || [];
    if (!currentDeleted.map(n => n.toUpperCase()).includes(trimmed.toUpperCase())) {
      deletedSaved[sId] = [...currentDeleted, trimmed];
      localStorage.setItem('mural_deleted_stage_details', JSON.stringify(deletedSaved));
    }

    setStageDetails(prev => {
      const current = prev[sId] || [];
      const updated = current.filter(item => item.toUpperCase() !== trimmed.toUpperCase());
      const next = { ...prev, [sId]: updated };
      localStorage.setItem('mural_stage_details', JSON.stringify(next));
      return next;
    });

    // Delete associated deliverables
    setDeliverables(prev => {
      const next = prev.filter(d => !(d.stageId === sId && d.itemName.toUpperCase() === trimmed.toUpperCase()));
      localStorage.setItem('mural_deliverables', JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      try {
        // Delete custom detail
        const { error: err1 } = await supabase
          .from('custom_stage_details')
          .delete()
          .eq('stage_id', sId)
          .eq('item_name', trimmed);

        if (err1) console.error('Erro do Supabase ao remover legenda:', err1);

        // Delete deliverables
        const { error: err2 } = await supabase
          .from('team_stage_deliverables')
          .delete()
          .eq('stage_id', sId)
          .eq('item_name', trimmed);

        if (err2) console.error('Erro do Supabase ao remover entregáveis:', err2);

        // Persist deletion in deleted_stage_details table in Supabase DB
        try {
          await supabase
            .from('deleted_stage_details')
            .upsert([{ stage_id: sId, item_name: trimmed }], { onConflict: 'stage_id,item_name' });
        } catch (e) {
          try {
            await supabase
              .from('deleted_stage_details')
              .insert([{ stage_id: sId, item_name: trimmed }]);
          } catch (e2) {}
        }

        await fetchSupabaseTeams();
      } catch (err) {
        console.error('Erro ao excluir tarefa no Supabase:', err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      teams,
      deliverables,
      stageDetails,
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
      addStageDetail,
      editStageDetail,
      deleteStageDetail,
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
