// theme.js
import { createTheme } from '@mui/material/styles';
import { MY_TOUR } from '../../utils/constants';
import { getConfig } from '../../utils/helpers';
const config = getConfig();
const theme = createTheme({
  typography: {
    fontFamily: 'inherit',
  },
});

export default theme;
