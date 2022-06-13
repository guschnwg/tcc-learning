import React, { useState, useEffect } from 'react';

import Level from './Level';
import supabase, { fetchOrCreate, GAMES_TABLE, GAME_LEVELS_TABLE, GAME_LEVEL_HINTS_TABLE, GUESSES_TABLE, HINTS_TABLE, LEVELS_TABLE } from '../supabase';
import Login from './Login';
import { User } from '@supabase/supabase-js';
import Path from './Path';

const Game: React.FC = () => {
  const [auth, setAuth] = useState<AuthData>();

  const [levels, setLevels] = useState<LevelsData>();

  const fetchLevels = async () => {
    const { data, error } = await supabase.from(LEVELS_TABLE).select().order("id");
    setLevels({ data, error });
  }

  useEffect(() => {
    if (!levels) fetchLevels()
  }, [levels]);

  if (!auth) {
    return (
      <div className="login-container">
        <Login onAuth={setAuth} />
      </div>
    );
  }

  if (!levels || !levels.data || !auth || !auth.user || !auth.session) {
    return (
      <div className="login-container">
        <span>
          Carregando ou erro kkkk
        </span>
      </div>
    )
  }

  return <InternalGame auth={auth as FulfilledAuthData} levels={levels.data} />
}

const InternalGame: React.FC<GameProps> = ({ auth, levels }) => {
  const [game, setGame] = useState<GameEntity>();
  const [currentLevel, setCurrentLevel] = useState(levels[0].id);
  const [bestGuesses, setBestGuesses] = useState<BestGuess[]>();

  const fetchOrCreateGame = async (user: User) => {
    const game = await fetchOrCreate<GameEntity>(
      GAMES_TABLE,
      { user_id: user.id },
      { guess_limit: 5 },
    );
    if (game) {
      setGame(game);
    }
  }

  const fetchBestGuesses = async (game: GameEntity, levels: LevelEntity[]) => {
    const { data, error } = await supabase
      .from(GUESSES_TABLE)
      .select(`*, ${GAME_LEVELS_TABLE}!inner(*, ${LEVELS_TABLE}!inner(*))`)
      .order("distance")
      .eq(`${GAME_LEVELS_TABLE}.game_id`, game.id);

    // TODO: get only best guesses per level

    if (data) {
      setBestGuesses(levels.map(level => ({
        level,
        guess: data.find(d => d.game_levels.level_id === level.id)
      })));
    }
  }

  useEffect(() => {
    if (!game) fetchOrCreateGame(auth.user);
  }, [game, auth.user])

  useEffect(() => {
    if (game && levels) fetchBestGuesses(game, levels);
  }, [game, levels])

  if (!game) {
    return null;
  }

  const level = levels.find(l => l.id === currentLevel);
  if (!level) {
    return <span>Nenhum nível aqui!</span>;
  }

  return (
    <div className="full">
      <VeryInternalGame
        key={currentLevel}
        auth={auth}
        level={level}
        game={game}
        onGuess={() => fetchBestGuesses(game, levels)}
        onLevelChange={setCurrentLevel}
      />

      <Path
        levels={levels}
        bestGuesses={bestGuesses || []}
        current={currentLevel}
        onLevelClick={setCurrentLevel}
      />
    </div>
  );
}

const VeryInternalGame: React.FC<{ auth: FulfilledAuthData, level: LevelEntity, game: GameEntity, onGuess: () => void, onLevelChange: (index: number) => void }> = ({ auth, game, level, onGuess, onLevelChange }) => {
  const [gameLevel, setGameLevel] = useState<GameLevelEntity>();
  const [guesses, setGuesses] = useState<GuessEntity[]>();
  const [hints, setHints] = useState<HintEntity[]>();
  const [hintsViewed, setHintsViewed] = useState<GameLevelHintEntity[]>();

  const fetchOrCreateUserLevel = async (game: GameEntity, level: LevelEntity) => {
    const gameLevel = await fetchOrCreate<GameLevelEntity>(
      GAME_LEVELS_TABLE,
      { game_id: game.id, level_id: level.id },
      { time_elapsed: 0 },
    )
    if (gameLevel) {
      setGameLevel(gameLevel);
    }
  }

  const fetchGuesses = async (gameLevel: GameLevelEntity) => {
    const { data, error } = await supabase.from(GUESSES_TABLE).select().match({ game_level_id: gameLevel.id });

    if (data) {
      setGuesses(data);
    }
  }

  const fetchHintsViewed = async (gameLevel: GameLevelEntity) => {
    const { data, error } = await supabase.from(GAME_LEVEL_HINTS_TABLE).select().match({ game_level_id: gameLevel.id });

    if (data) {
      setHintsViewed(data);
    }
  }

  const fetchHints = async (level: LevelEntity) => {
    const { data, error } = await supabase.from(HINTS_TABLE).select().match({ level_id: level.id });

    if (data) {
      setHints(data);
    }
  }

  useEffect(() => {
    if (!gameLevel) fetchOrCreateUserLevel(game, level);
  }, [gameLevel, game, level]);

  useEffect(() => {
    if (gameLevel) {
      fetchGuesses(gameLevel);
      fetchHintsViewed(gameLevel);
    }
  }, [gameLevel]);

  useEffect(() => {
    if (level) fetchHints(level);
  }, [level]);

  if (!gameLevel) {
    return null;
  }

  const handleHintView = async (hint: HintEntity, time: number) => {
    const { data, error } = await supabase
      .from(GAME_LEVEL_HINTS_TABLE)
      .insert({ game_level_id: gameLevel.id, hint_id: hint.id, time_elapsed: time });

    if (data && data[0]) {
      setHintsViewed(prev => [...(prev || []), data[0]]);
    }
  }

  const handleGuess = async (marker: google.maps.LatLngLiteral, osmData: OSMData, time: number, distance: number) => {
    const { data, error } = await supabase
      .from(GUESSES_TABLE)
      .insert({
        game_level_id: gameLevel.id,
        distance: distance,
        lat: marker.lat,
        lng: marker.lng,
        time_elapsed: time,
        data: osmData,
        hints_viewed: (hintsViewed || []).length
      });

    if (data && data[0]) {
      setGuesses(prev => [...(prev || []), data[0]])
      onGuess();
      return data[0];
    }

    return null;
  }

  const handleTimePass = async (time: number) => {
    await supabase
      .from(GAME_LEVELS_TABLE)
      .update({ time_elapsed: time })
      .match({ game_id: game.id, level_id: level.id });
  }

  return (
    <Level
      current={level}
      hints={hints || []}
      guessLimit={game.guess_limit}
      startTime={gameLevel.time_elapsed}
      guesses={guesses || []}
      hintsViewed={hintsViewed || []}
      onNext={() => onLevelChange(level.id + 1)}
      onGuess={handleGuess}
      onHintViewed={handleHintView}
      onTimePassed={handleTimePass}
    />
  );
};

export default Game;
