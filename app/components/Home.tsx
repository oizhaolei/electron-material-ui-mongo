import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Datastore from 'nedb';
import Button from '@material-ui/core/Button';

import routes from '../constants/routes.json';
import styles from './Home.css';

export default function Home(): JSX.Element {
  const [data, setData] = useState([]);

  useEffect(() => {
    // init db
    const db = new Datastore({
      // filename: './datafile',
      // autoload: true,
    });

    [...Array(5)].forEach((_, i) => {
      db.insert({
        name: `bigbounty ${i}`,
        age: 16,
      });
    });

    db.find({}, (err, docs) => {
      setData(docs);
    });
  }, []);

  return (
    <div className={styles.container} data-tid="container">
      <h2>Home</h2>
      <Link to={routes.COUNTER}>to Counter</Link>
      <Button variant="contained" color="primary">
        Hello World
      </Button>
      <Link to="/dashboard">to Dashboard</Link>
      {data.map((record) => (
        <div key={record.name}>{`${record.name} - ${record.age}`}</div>
      ))}
    </div>
  );
}
