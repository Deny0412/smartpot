export interface HumidityRecord {
    timestamp: Date;
    value: number;
  }
  export interface TemperatureRecord {
    timestamp: Date
    value: number
}

export interface LightnessRecord {
    timestamp: Date
    value: number
}


  
export interface Flowerpot {
  id: string
  name: string
  profile: string
  humidity: number
  history_humidity: HumidityRecord[]
  temperature: number
  history_temperature: TemperatureRecord[]
  light: number
  history_light: LightnessRecord[]
  fullness: number
}

  export interface FlowerpotProfile {
    id: string
    name: string
    avatar_img_url: string
  
    max_humidity: number
    min_humidity: number
  
    min_temperature: number
    max_temperature: number
  
    min_light: number
    max_light: number
  
    irrigation_last: Date
  
    household_id: string
  }
  
  