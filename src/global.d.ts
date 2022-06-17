import { ApiError, PostgrestError, Session, User } from "@supabase/supabase-js";

declare global {
  interface LevelProps {
    current: LevelEntity;
    hints: HintEntity[];
    guessLimit: number
    startTime: number
    guesses: GuessEntity[]
    hintsViewed: GameLevelHintEntity[]
    onGuess: (marker: google.maps.LatLngLiteral, data: OSMData, time: number, distance: number) => Promise<Guess>;
    onHintViewed: (hint: HintEntity, time: number) => void;
    onTimePassed: (time: number) => void
    onNext: () => void
  }

  interface PlaceChooserModalProps {
    show: boolean
    canGuess: boolean
    level: LevelEntity
    guesses: Guess[]
    onHide: () => void
    onConfirm: (marker: google.maps.LatLngLiteral, data: OSMData, distance: number) => Promise<Guess>
    onNext: () => void
  }

  interface OpenStreetMapDataProps {
    data: OSMData
    className?: string
    distance?: number
  }

  interface PlaceChooserProps {
    level: LevelEntity
    canGuess: boolean
    guesses: Guess[]
    onConfirm: (marker: google.maps.LatLngLiteral, data: OSMData, distance: number) => Promise<Guess>
    onNext: () => void
  }

  interface PlaceChooserMarkerProps {
    placeCoords: google.maps.LatLngLiteral
    guessCoords: google.maps.LatLngLiteral
    showInfoWindow: boolean
    onShowInfoWindow: (show: boolean) => void
    onConfirm: (marker: google.maps.LatLngLiteral, data: OSMData, distance: number) => void
  }

  interface LoginProps {
    onAuth: (auth: Auth, guessLimit: number, mode: number, isNew: boolean) => void
  }

  interface GameProps {
    auth: FulfilledAuthData
    guessLimit: number
    mode: number
  }

  //

  interface FulfilledAuthData {
    user: User
    session: Session
    error: ApiError
    isNew: boolean
  }

  interface AuthData {
    user: User | null
    session: Session | null
    error: ApiError | null
    isNew: boolean
  }

  interface LevelsData {
    data: LevelEntity[] | null
    error: PostgrestError | null
  }

  interface LeaderboardData {
    game_levels: {
      games: {
        profiles: {
          id: string
          name: string
        }
      }
      levels: LevelEntity
    }
    data: OSMData
    time_elapsed: number
    distance: number
    hints_viewed: number
  }

  interface GeneralLeaderboardData {
    user: {
      id: string
      name: string
    }
    guesses: LeaderboardData[]
    totalGuesses: number
    correctGuesses: number
    totalDistance: number
    totalTime: number
    averageDistance: number
    averageTime: number
  }

  //

  interface OSMAddress {
    town?: string
    city?: string
    city_district?: string
    municipality?: string
    neighbourhood?: string
    suburb?: string
    district?: string
    borough?: string
    subdivision?: string
    county?: string
    state_district?: string
    village?: string
    region?: string
    state: string
    postcode: string
    country: string
    country_code: string
  }

  interface OSMData {
    place_id: number
    licence: string
    osm_type: string
    osm_id: number
    lat: string
    lon: string
    place_rank: number
    category: string
    type: string
    importance: number
    addresstype: string
    name: string
    display_name: string
    address: OSMAddress
    boundingbox: string[]
  }

  //

  interface GameEntity {
    id: number
    user_id: string
    guess_limit: number
    created_at: string
    modes: {
      mode_levels: {
        levels: LevelEntity
      }[]
    }
  }

  interface ModeEntity {
    id: number
    title: string
    description: string
  }

  interface GameLevelEntity {
    id: number
    created_at: number
    game_id: number
    level_id: number
    time_elapsed: number
  }

  interface HintView {
    id: number
    viewed: boolean
    timestamp: number
  }

  interface GuessEntity {
    id: number
    created_at: number
    game_level_id: number
    lat: number
    lng: number
    distance: number
    time_elapsed: number
    hints_viewed: number
    data: OSMData
  }

  interface LevelEntity {
    id: number
    city: City
    lat: number
    lng: number
    data: OSMData
  }

  interface HintEntity {
    id: number
    description: string
    level_id: number
  }

  interface GameLevelHintEntity {
    id: number
    game_level_id: number
    hint_id: number
    time_elapsed: number
  }

  interface BestGuess {
    guess: GuessEntity
    level: LevelEntity
  }

  interface UserLevel {
    id: number
    level_id: number
    current_time: number
    completed: boolean
    hints: HintView[]
    guesses: Guess[]
  }

  interface UserData {
    id: number
    user: string
    guess_limit: number
    data: UserLevel[]
  }

  //

  interface Data {
    levels: Level[]
  }

  export interface Level {
    id: number
    city: City
    hints: Hint[]
    markers: LevelMarker[]
    coordinates: Coordinates
  }

  interface LevelMarker {
    coordinates: Coordinates
    data: string
    user: string
  }

  export interface City {
    name: string
    state: string
    country: string
  }

  export interface Hint {
    id: number
    description: string
  }

  export interface Coordinates {
    lat: number
    lng: number
  }
}

export { };
