declare global {
  interface PlaceChooserModalProps {
    show: boolean
    onHide: () => void
    onConfirm: (location: google.maps.LatLngLiteral, data: OSMData) => void
  }

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

  interface OpenStreetMapDataProps {
    data: OSMData
    className?: string
    distance?: number
  }

  interface UserData {

  }

  interface Data {
    
  }
}

export {};
