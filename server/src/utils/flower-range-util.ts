export function isValueOutOfRange(
    typeOfData: string,
    value: number,
    profile: any,
    flowerName: string
  ): { outOfRange: boolean; message: string; flower_name: string; } | null {
    // Mapping typeOfData -> how to check
    const checks: {
      [key: string]: (
        value: number,
        profile: any
      ) => { outOfRange: boolean; message: string; flower_name: string; } | null;
    } = {
      soil: (value, profile) => {
        const humidityProfile = profile?.humidity;
        if (!humidityProfile) return null;
        const { min, max } = humidityProfile;
        if (value < min || value > max) {
          return {
            outOfRange: true,
            message: `Soil humidity out of range! Measured ${value}%, expected between ${min}% - ${max}%`,
            flower_name: flowerName
          };
        }
        return { outOfRange: false, message: "", flower_name: ""};
      },
      temperature: (value, profile) => {
        const tempProfile = profile?.temperature;
        if (!tempProfile) return null;
        const { min, max } = tempProfile;
        if (value < min || value > max) {
          return {
            outOfRange: true,
            message: `Temperature out of range! Measured ${value}°C, expected between ${min}°C - ${max}°C`,
            flower_name: flowerName
  
          };
        }
        return { outOfRange: false, message: "", flower_name: "" };
      },
      light: (value, profile) => {
        const lightProfile = profile?.light;
        if (!lightProfile) return null;
        const { min, max } = lightProfile;
        if (value < min || value > max) {
          return {
            outOfRange: true,
            message: `Light intensity out of range! Measured ${value}lux, expected between ${min}lux - ${max}lux`,
            flower_name: flowerName
  
          };
        }
        return { outOfRange: false, message: "", flower_name: "" };
      },
      battery: (value, _profile) => {
        // Battery threshold is hardcoded, not in profile
        const batteryThreshold = 30; // 30%
        if (value < batteryThreshold) {
          return {
            outOfRange: true,
            message: `Battery low! Measured ${value}%, should be at least ${batteryThreshold}%`,
            flower_name: flowerName
  
          };
        }
        return { outOfRange: false, message: "", flower_name: "" };
      },
    };
  
    const checkFn = checks[typeOfData];
    if (!checkFn) {
      return null; // Unknown type, skip check
    }
  
    return checkFn(value, profile);
  }