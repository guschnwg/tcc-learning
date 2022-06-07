declare global {
  interface LevelProps {
    current: Level;
    guessLimit: number
    userData?: UserLevel;
    onNext: () => void
    onGuess: (marker: google.maps.LatLngLiteral, data: OSMData, time: number, distance: number) => Promise<Guess>;
    onHintViewed: (index: number, time: number) => void;
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

  // 

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

  interface HintView {
    id: number
    viewed: boolean
    timestamp: number
  }

  interface Guess {
    id: number
    distance: number
    coordinates: Coordinates
    hints_viewed: number
    timestamp: number
    data: OSMData
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
