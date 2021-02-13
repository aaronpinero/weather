export type IconPrefix = "fas" | "fab" | "far" | "fal" | "fad";
export type IconPathData = string | string[]

export interface IconLookup {
  prefix: IconPrefix;
  // IconName is defined in the code that will be generated at build time and bundled with this file.
  iconName: IconName;
}

export interface IconDefinition extends IconLookup {
  icon: [
    number, // width
    number, // height
    string[], // ligatures
    string, // unicode
    IconPathData // svgPathData
  ];
}

export interface IconPack {
  [key: string]: IconDefinition;
}

export type IconName = 'cloud-drizzle' | 
  'cloud-hail' | 
  'cloud-hail-mixed' | 
  'cloud-moon' | 
  'cloud-moon-rain' | 
  'cloud-showers' | 
  'cloud-showers-heavy' | 
  'cloud-sleet' | 
  'cloud-snow' | 
  'cloud-sun' | 
  'cloud-sun-rain' | 
  'clouds' | 
  'clouds-moon' | 
  'clouds-sun' | 
  'cog' | 
  'fog' | 
  'location-arrow' | 
  'moon' | 
  'moon-cloud' | 
  'moon-stars' | 
  'redo' | 
  'snow-blowing' | 
  'snowflake' | 
  'snowflakes' | 
  'sun' | 
  'sun-cloud' | 
  'sun-haze' | 
  'sunrise' | 
  'sunset' | 
  'temperature-frigid' | 
  'temperature-high' | 
  'temperature-hot' | 
  'temperature-low' | 
  'thunderstorm' | 
  'thunderstorm-moon' | 
  'thunderstorm-sun' | 
  'times' | 
  'umbrella' | 
  'wind' | 
  'cloud-drizzle' | 
  'cloud-hail' | 
  'cloud-hail-mixed' | 
  'cloud-moon' | 
  'cloud-moon-rain' | 
  'cloud-showers' | 
  'cloud-showers-heavy' | 
  'cloud-sleet' | 
  'cloud-snow' | 
  'cloud-sun' | 
  'cloud-sun-rain' | 
  'clouds' | 
  'clouds-moon' | 
  'clouds-sun' | 
  'cog' | 
  'fog' | 
  'location-arrow' | 
  'moon' | 
  'moon-cloud' | 
  'moon-stars' | 
  'redo' | 
  'snow-blowing' | 
  'snowflake' | 
  'snowflakes' | 
  'sun' | 
  'sun-cloud' | 
  'sun-haze' | 
  'sunrise' | 
  'sunset' | 
  'temperature-frigid' | 
  'temperature-high' | 
  'temperature-hot' | 
  'temperature-low' | 
  'thunderstorm' | 
  'thunderstorm-moon' | 
  'thunderstorm-sun' | 
  'times' | 
  'umbrella' | 
  'wind';
