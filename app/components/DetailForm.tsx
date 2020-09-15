import React, { useState, useEffect, useRef, useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: 800,
  },
}));

export default function DetailForm({ columns, list }) {
  useEffect(() => {
  }, [list]);

  return (
    <div>list</div>
  );
}
