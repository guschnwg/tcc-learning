import { ApiError, PostgrestError, Session, User } from "@supabase/supabase-js";

declare global {
  interface LevelProps {
    current: LevelEntity;
    hints: HintEntity[];
    guessLimit: number
    startTime: number
    guesses: GuessEntity[]
    hintsViewed: GameLevelHintEntity[]
    onNext: () => void
    onGuess: (marker: google.maps.LatLngLiteral, data: OSMData, time: number, distance: number) => Promise<Guess>;
    onHintViewed: (hint: HintEntity, time: number) => void;
    onTimePassed: (time: number) => void
  }

  interface PlaceChooserModalProps {
    show: boolean
    canGuess: boolean
    coordinates: google.maps.LatLngLiteral
    guesses: Guess[]
    onHide: () => void
    onConfirm: (marker: google.maps.LatLngLiteral, data: OSMData, distance: number) => Promise<Guess>
  }

  interface OpenStreetMapDataProps {
    data: OSMData
    className?: string
    distance?: number
  }

  interface PlaceChooserProps {
    placeCoords: google.maps.LatLngLiteral
    canGuess: boolean
    guesses: Guess[]
    onConfirm: (marker: google.maps.LatLngLiteral, data: OSMData, distance: number) => Promise<Guess>
  }

  interface PlaceChooserMarkerProps {
    placeCoords: google.maps.LatLngLiteral
    guessCoords: google.maps.LatLngLiteral
    showInfoWindow: boolean
    onShowInfoWindow: (show: boolean) => void
    onConfirm: (marker: google.maps.LatLngLiteral, data: OSMData, distance: number) => void
  }

  interface LoginProps {
    onAuth: (auth: Auth) => void
  }

  interface GameProps {
    auth: FulfilledAuthData
    levels: LevelEntity[]
  }

  //

  interface FulfilledAuthData {
    user: User
    session: Session
    error: ApiError
  }

  interface AuthData {
    user: User | null
    session: Session | null
    error: ApiError | null
  }

  interface LevelsData {
    data: LevelEntity[] | null
    error: PostgrestError | null
  }

  interface LeaderboardData {
    user: string
    guesses: {
      id: number
      levelId: number
      distance: number
      hints: number
    }[]
  }

  //

  interface OSMAddress {
    town?: string
    city?: string
    city_district?: string
    municipality?: string
    neighbourhood?: string
    suburb?: string
    county?: string
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
