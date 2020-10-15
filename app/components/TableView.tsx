import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Typography from '@material-ui/core/Typography';
import StorageIcon from '@material-ui/icons/Storage';
import Label from '@material-ui/icons/Label';
import Grid from '@material-ui/core/Grid';


const useTreeItemStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.text.secondary,
      '&:hover > $content': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:focus > $content, &$selected > $content': {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
        color: 'var(--tree-view-color)',
      },
      '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
        backgroundColor: 'transparent',
      },
    },
    content: {
      color: theme.palette.text.secondary,
      borderTopRightRadius: theme.spacing(2),
      borderBottomRightRadius: theme.spacing(2),
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      '$expanded > &': {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    group: {
      marginLeft: 0,
      '& $content': {
        paddingLeft: theme.spacing(2),
      },
    },
    expanded: {},
    selected: {},
    label: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: 'inherit',
      flexGrow: 1,
    },
  }),
);

function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, ...other } = props;

  return (
    <TreeItem
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor,
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}

const useStyles = makeStyles(
  createStyles({
    root: {
      height: 500,
      flexGrow: 1,
      maxWidth: 400,
      overflowY: 'scroll',
    },
  }),
);

export default function TableView({ label, onChange }) {
  const classes = useStyles();
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    setSchemas(ipcRenderer.sendSync('schemas', { sync: true }));
  }, []);

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Grid container spacing={3}>
        <TreeView
          className={classes.root}
          defaultExpanded={schemas.map((t) => t.name)}
          defaultCollapseIcon={<ArrowDropDownIcon />}
          defaultExpandIcon={<ArrowRightIcon />}
          defaultEndIcon={<div style={{ width: 24 }} />}
          onNodeSelect={(event, value) => {
            console.log(value);
            const [schema, field] = value.split('.');
            onChange(schema, field);
          }}
        >
          {
            schemas.map((t) => (
              <StyledTreeItem
                key={t.name}
                nodeId={t.name}
                labelText={t.name}
                labelIcon={StorageIcon}
              >
                {
                  Object.keys(t.definition).map((f) => (
                    <StyledTreeItem
                      key={`${t.name}.${f}`}
                      nodeId={`${t.name}.${f}`}
                      labelText={f}
                      labelIcon={Label}
                      color="#1a73e8"
                      bgColor="#e8f0fe"
                    />

                  ))
                }
              </StyledTreeItem>
            ))
          }
        </TreeView>
      </Grid>
    </Paper>
  );
}
