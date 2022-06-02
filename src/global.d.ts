declare global {
  interface PlaceChooserModalProps {
    show: boolean
    onHide: () => void
    onConfirm: (location: google.maps.LatLngLiteral, data: OSMData) => void
  }

  interface OpenStreetMapDataProps {
    data: OSMData
    className?: string
    distance?: number
  }

  interface PlaceChooserProps {
    marker?: google.maps.LatLngLiteral
    onMapClick: (e: google.maps.MapMouseEvent) => void
    onConfirm: any
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
    hints_viewed: number
    timestamp: number
    data: OSMData
  }

  interface UserLevel {
    id: number
    level_id: number
    completed: boolean
    hints: HintView[]
    guesses: Guess[]
  }

  interface UserData {
    id: number
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
