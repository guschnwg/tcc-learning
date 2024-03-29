import React, { useState, useEffect, useMemo } from 'react';

import Level from './Level';
import supabase, { BEST_GUESSES_TABLE, fetchOrCreate, GAMES_TABLE, GAME_LEVELS_TABLE, GAME_LEVEL_HINTS_TABLE, GUESSES_TABLE, HINTS_TABLE, LEVELS_TABLE, MODES_TABLE, MODE_LEVELS_TABLE } from '../supabase';
import Login from './Login';
import { User } from '@supabase/supabase-js';
import Path from './Path';
import Button from './Button';
import Config from './Config';
import { Link } from 'react-router-dom';
import Tutorial from './Tutorial';

const Game: React.FC = () => {
  const [auth, setAuth] = useState<AuthData>();
  const [gameData, setGameData] = useState<{ guessLimit: number, mode: number }>();

  if (!auth) {
    return (
      <div className="login-container">
        <Login
          onAuth={(auth, guessLimit, mode, isNew) => {
            setAuth({ ...auth, isNew });
            setGameData({ guessLimit, mode });
          }}
        />

        <Link to="/leaderboard" className="leaderboard-link">
          Ranking dos melhores
        </Link>
      </div>
    );
  }

  if (!auth || !auth.user || !auth.session || !gameData) {
    return (
      <div className="login-container">
        <span>
          Carregando ou erro kkkk
        </span>
      </div>
    )
  }

  return <InternalGame auth={auth as FulfilledAuthData} guessLimit={gameData.guessLimit} mode={gameData.mode} />
}

const InternalGame: React.FC<GameProps> = ({ auth, guessLimit, mode }) => {
  const [game, setGame] = useState<GameEntity>();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [bestGuesses, setBestGuesses] = useState<BestGuess[]>();

  const levels: LevelEntity[] = useMemo(() => game?.modes.mode_levels.map(ml => ml.levels) ?? [], [game]);

  const fetchOrCreateGame = async (user: User, mode: number, guessLimit: number) => {
    const game = await fetchOrCreate<GameEntity>(
      GAMES_TABLE,
      { user_id: user.id, guess_limit: guessLimit, mode_id: mode },
      {},
      `*, ${MODES_TABLE}!inner(*, ${MODE_LEVELS_TABLE}!inner(*, ${LEVELS_TABLE}!inner(*)))`,
    );
    if (game) {
      setGame(game);
    }
  }

  const fetchBestGuesses = async (game: GameEntity, levels: LevelEntity[]) => {
    const { data } = await supabase
      .from(BEST_GUESSES_TABLE)
      .select(`*, ${GAME_LEVELS_TABLE}!inner(*, ${LEVELS_TABLE}!inner(*))`)
      .order("distance")
      .eq(`${GAME_LEVELS_TABLE}.game_id`, game.id);

    if (data) {
      setBestGuesses(levels.map(level => ({
        level,
        guess: data.find(d => d.game_levels.level_id === level.id)
      })));
    }
  }

  useEffect(() => {
    if (!game) fetchOrCreateGame(auth.user, mode, guessLimit);
  }, [game, mode, guessLimit, auth.user]);

  useEffect(() => {
    if (game && levels) fetchBestGuesses(game, levels);
  }, [game, levels])

  if (!game) {
    return null;
  }

  const level = levels[currentLevel];
  if (!level) {
    return <span>Nenhum nível aqui!</span>;
  }

  return (
    <div className="game-container full">
      <VeryInternalGame
        key={currentLevel}
        auth={auth}
        level={level}
        game={game}
        onGuess={() => fetchBestGuesses(game, levels)}
        onNext={() => setCurrentLevel(prev => prev + 1)}
      />

      <div className="game-footer">
        <div>
          <Config />

          <Tutorial guessLimit={game.guess_limit} show={auth.isNew} />
        </div>

        <div>
          <Path
            levels={levels}
            bestGuesses={bestGuesses || []}
            current={currentLevel}
            onLevelClick={setCurrentLevel}
          />

          <Button onClick={() => setCurrentLevel(prev => prev + 1)}>
            Pular
          </Button>
        </div>
      </div>

    </div>
  );
}

const VeryInternalGame: React.FC<{ auth: FulfilledAuthData, level: LevelEntity, game: GameEntity, onGuess: () => void, onNext: () => void }> = ({ auth, game, level, onGuess, onNext }) => {
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
    const { data } = await supabase.from(GUESSES_TABLE).select().match({ game_level_id: gameLevel.id });

    if (data) {
      setGuesses(data);
    }
  }

  const fetchHintsViewed = async (gameLevel: GameLevelEntity) => {
    const { data } = await supabase.from(GAME_LEVEL_HINTS_TABLE).select().match({ game_level_id: gameLevel.id });

    if (data) {
      setHintsViewed(data);
    }
  }

  const fetchHints = async (level: LevelEntity) => {
    const { data } = await supabase.from(HINTS_TABLE).select().match({ level_id: level.id });

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

  const handleTimePass = async (time: number) => {
    await supabase
      .from(GAME_LEVELS_TABLE)
      .update({ time_elapsed: time })
      .match({ game_id: game.id, level_id: level.id });
  }

  const handleHintView = async (hint: HintEntity, time: number) => {
    const { data } = await supabase
      .from(GAME_LEVEL_HINTS_TABLE)
      .insert({ game_level_id: gameLevel.id, hint_id: hint.id, time_elapsed: time });

    handleTimePass(time);

    if (data && data[0]) {
      setHintsViewed(prev => [...(prev || []), data[0]]);
    }
  }

  const handleGuess = async (marker: google.maps.LatLngLiteral, osmData: OSMData, time: number, distance: number) => {
    const { data } = await supabase
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

    handleTimePass(time);

    if (data && data[0]) {
      setGuesses(prev => [...(prev || []), data[0]])
      onGuess();
      return data[0];
    }

    return null;
  }

  return (
    <Level
      current={level}
      hints={hints || []}
      guessLimit={game.guess_limit}
      startTime={gameLevel.time_elapsed}
      guesses={guesses || []}
      hintsViewed={hintsViewed || []}
      onNext={onNext}
      onGuess={handleGuess}
      onHintViewed={handleHintView}
      onTimePassed={handleTimePass}
    />
  );
};

export default Game;
