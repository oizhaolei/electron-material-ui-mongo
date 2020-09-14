import React, { useState, useEffect, useRef, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import * as mui from '@material-ui/icons';

const came2underscore = (s) =>
  s.replace(/(?:^|\.?)([A-Z])/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "");

let Icons = (props) => {
  const { icons, classes, onChange } = props;

  const handleIconClick = (icon) => () => {
    console.log('handleIconClick icon:', icon);
    onChange(came2underscore(icon.name));
  };

  return (
    <div>
      {icons.map((icon) => {
        return (
          <span
            key={icon.importName}
            onClick={handleIconClick(icon)}
            className={clsx('markdown-body', classes.icon)}
          >
            <icon.Component
              tabIndex={-1}
              title={icon.importName}
              className={classes.iconSvg}
            />
          </span>
        );
      })}
    </div>
  );
};
Icons = React.memo(Icons);

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 800,
  },
  icon: {
    display: 'inline-block',
    width: 86,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    color: theme.palette.text.secondary,
    margin: '0 4px',
    fontSize: 12,
    '& p': {
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  iconSvg: {
    boxSizing: 'content-box',
    cursor: 'pointer',
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create(['background-color', 'box-shadow'], {
      duration: theme.transitions.duration.shortest,
    }),
    fontSize: 40,
    padding: theme.spacing(2),
    margin: theme.spacing(0.5, 0),
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
    },
  },
}));

const allIconsMap = {};
const allIcons = Object.keys(mui)
  .sort()
  .map((importName) => {
    let theme;
    if (importName.indexOf('Outlined') !== -1) {
      theme = 'Outlined';
    } else if (importName.indexOf('TwoTone') !== -1) {
      theme = 'Two tone';
    } else if (importName.indexOf('Rounded') !== -1) {
      theme = 'Rounded';
    } else if (importName.indexOf('Sharp') !== -1) {
      theme = 'Sharp';
    } else {
      theme = 'Filled';
    }

    const name = importName.replace(/(Outlined|TwoTone|Rounded|Sharp)$/, '');

    const icon = {
      importName,
      name,
      theme,
      Component: mui[importName],
    };
    allIconsMap[importName] = icon;
    return icon;
  });

export default function SearchIcons({ onChange }) {
  const classes = useStyles();
  const [theme, setTheme] = useState('Filled');
  const [keys, setKeys] = useState(null);

  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const icons = useMemo(
    () =>
      (keys === null ? allIcons : keys.map((key) => allIconsMap[key])).filter(
        (icon) => theme === icon.theme,
      ),
    [theme, keys],
  );

  return (
    <Grid container className={classes.root}>
      <Grid item xs={24} sm={24}>
        <Icons
          icons={icons}
          classes={classes}
          onChange={onChange}
        />
      </Grid>
    </Grid>
  );
}
