import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

export default function Query({ dataState, onChange }) {
  const [query, setQuery] = useState(dataState.query);

  const [querys, setQueries] = useState([]);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState();

  useEffect(() => {
    const schemasListener = (event, arg) => {
      setQueries(arg.map((s) => pluralize(s.query.toLowerCase())));
    };
    ipcRenderer.on('schemas', schemasListener);
    ipcRenderer.send('schemas');

    return () => {
      ipcRenderer.removeListener('schemas', schemasListener);
    };
  }, []);

  const handleChange = (v) => {
    setQuery(v);

    const err = querys.includes(pluralize(v.toLowerCase()));
    setError(err);
    setHelperText(err && 'duplicated name');
    onChange({
      query: v,
      error: err,
    });
  };
  return (
    <>
    </>
  );
}
