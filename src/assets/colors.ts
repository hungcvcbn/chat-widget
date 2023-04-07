import { getConfig } from '../utils/helpers';
import colors from './colors.module.scss';
const config = getConfig();
// export const 
export const BACKGROUND = colors.background;
export const PRIMARY = config && config?.color ? config.color : colors.PRIMARY;
export const SECONDARY = colors.SECONDARY;
export const GREY = '#BDBDBD';
export const LIGHT_GREY = '#e9e9e9';
export const LIGHT_GREY_50 = '#D9DBDC';
export const DARK_GREY = '#757575';
export const HOVER_GREY = '#F5F5F5';
export const BLACK_TEXT = '#212121';
export const BLACK_TEXT_1 = '#3F4445';
export const BLUE = '#004EBC';
export const BLUE_LIGHT_1 = '#38C5F4';
export const BLUE_LIGHT_2 = '#EAF6FE';
export const LIGHT_BLUE = '#4FC3F7';
export const BLUE_50 = '#e6f6fe';
export const BLUE_100 = '#DCEBFB';
export const BLUE_200 = '#9fbff8';
export const DARK_BLUE = '#1976D2';
export const DARK_BLUE_100 = '#0047BB';
export const GREEN = '#57C478';
export const GREEN_LIGHT = '#158C32';
export const GREEN_300 = '#18A43B';
export const GREEN_50_1 = '#E9FCEE';
export const PURPLE = '#BA68C8';
export const RED = '#F44336';
export const RED_LIGHT = '#FF2C00';
export const LIGHT_GREEN = '#E9FCEE';
export const LIGHT_GREEN_50 = '#C8F2D8';
export const RED_100 = '#FF2C00';
export const DARK_GREEN = '#009688';
export const YELLOW = '#ff9800';
export const YELLOW_100 = '#FFB822';
export const BROWN = '#795548';
export const PINK = '#cc0066';
export const ORANGE = '#ff7043';
export const BLACK = '#000000';
export const GREY_100 = '#F5F5F5';
export const GREY_350 = '#D6D6D6';
export const GREY_500 = '#9e9e9e';
export const GREY_900 = '#0B0C0D';
export const GRAY_LIGHT_1 = '#677072';
export const GRAY_LIGHT_2 = '#B2B8B9';
export const GREY_600= '#757575';
export const GREY_600_1 = '#3F4445';
export const WHITE = '#FFFFFF';
export const GREEN_TRIP_ADVISOR = '#34E0A1';
export const ORANGE_GRADIENT = 'linear-gradient(to right top, #feb72e, #ffa630, #ff9435, #ff823c, #fd7144)';
export const CYAN_300 = '#09C1FF';
export const {
    TEAL,
    TEAL_400,
    TEAL_300,
    TEAL_200,
    TEAL_100,
    TEAL_50,
  
    PURPLE_300,
    PURPLE_200,
    PURPLE_100,
    PURPLE_50,
  
    BLACK_90,
    GREY_400,
    GREY_300,
    GREY_200,
    GREY_50,
    WHITE_50,
    WHITE_10,
  
    BLUE_NAVY,
    BLUE_600,
    BLUE_500,
    BLUE_400,
    BLUE_300,
    BLUE_250,
  
    GREEN_400,
    GREEN_200,
    GREEN_100,
    GREEN_80,
    GREEN_50,
  
    RED_600,
    RED_500,
    RED_300,
    RED_200,
    RED_50,
  
    BROWN_300,
    BROWN_200,
    BROWN_100,
    BROWN_50,
  
    ORANGE_500,
    ORANGE_300,
    ORANGE_250,
    ORANGE_200,
    ORANGE_100,
    ORANGE_50,
  
    YELLOW_300,
    YELLOW_200,
    YELLOW_50,
  
    PINK_300,
    PINK_200,
    PINK_100,
    PINK_50,
  
    CRAYOLA,
  } = colors;