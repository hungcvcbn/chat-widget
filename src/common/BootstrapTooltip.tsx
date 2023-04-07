import { Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
// import { GREY_900 } from 'assets/theme/colors';
import React from 'react';
import { GREY_900 } from '../assets/colors';

const useStylesBootstrap = makeStyles(
  (theme :any) => ({
    arrow: {
      color: GREY_900,
    },
    tooltip: {
      backgroundColor: GREY_900,
    },
  }),
  { index: 1 }
);
const BootstrapTooltip = (props: any) => {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
};

export default BootstrapTooltip;
