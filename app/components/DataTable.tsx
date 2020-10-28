import React, { useState, useRef, useContext } from 'react';
import log from 'electron-log';
import { ipcRenderer } from 'electron';
import { useTranslation } from 'react-i18next';
import Store from 'electron-store';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import MaterialTable from 'material-table';

import DetailForm from './DetailForm';
import StoreContext from '../store/StoreContext';

const store = new Store();

const Alert = (props: AlertProps) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const ConfirmDialog = ({ open, onClose, onOK }) => {
  const { t } = useTranslation();
  const [{ schema: dataState }] = useContext(StoreContext);

  return (
    <>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        aria-labelledby="simple-dialog-title"
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>確認</DialogTitle>
        <DialogContent>
          確認
          <List>
            {Object.keys(dataState.changes).map((field) => (
              <ListItem key={field}>
                <ListItemText
                  primary={`${field}:${dataState.changes[field]}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button
            onClick={() => {
              onOK();
              onClose();
            }}
            color="primary"
          >
            {t('Ok')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const DetailDialog = ({ list, open, onClose, onChange }) => {
  const { t } = useTranslation();
  const [{ schema: dataState }] = useContext(StoreContext);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSave = () => {
    // confirm
    setConfirmOpen(true);
  };
  const confirmedSave = () => {
    if (dataState.changeList.length > 0) {
      ipcRenderer
        .invoke('update', {
          name: dataState.name,
          filter: {
            _id: {
              $in: dataState.changeList.map((r) => r._id),
            },
          },
          doc: dataState.changes,
        })
        .then((results) => {
          log.info('update results', results);
        })
        .catch((e) => {
          alert(e.toString());
        });
    } else {
      ipcRenderer
        .invoke('insert-many', {
          name: dataState.name,
          docs: [dataState.changes],
        })
        .then((results) => {
          log.info('insert results', results);
        })
        .catch((e) => {
          alert(e.toString());
        });
    }
    onClose();
    onChange();
  };

  return (
    <>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        aria-labelledby="simple-dialog-title"
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          Title: {list.length > 1 ? `${list.length} rows` : t('new')}
        </DialogTitle>
        <DialogContent>
          <DetailForm list={list} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button onClick={handleSave} color="primary">
            {t('Ok')}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onOK={confirmedSave}
      />
    </>
  );
};

export default function DataTable() {
  const { t } = useTranslation();
  const [{ schema: dataState }, dispatch] = useContext(StoreContext);
  const [pageSize, setPageSize] = useState(
    store.get(`schema.${dataState.name}.pageSize`, 20)
  );

  const tableRef = useRef();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleClickDetailOpen = () => {
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    dispatch({
      type: 'SCHEMA_DATA_CLEAR',
    });
    setDetailOpen(false);
  };
  const handleChangeRowsPerPage = (size) => {
    setPageSize(size);
    store.set(`schema.${dataState.name}.pageSize`, size);
  };

  // snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClick = () => {
    setSnackbarOpen(true);
  };
  const handleSnackbarClose = (event, reason) => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Typography variant="body2" gutterBottom>
        {t('DataTable demo')}
      </Typography>
      {dataState.materialDefinition && dataState.materialDefinition.length > 0 && (
        <MaterialTable
          tableRef={tableRef}
          isLoading={isLoading}
          title={dataState.name}
          options={{
            search: false,
            pageSize,
            selection: true,
            filtering: true,
            pageSizeOptions: [20, 50, 100],
          }}
          columns={dataState.materialDefinition}
          data={(query) =>
            new Promise((resolve, reject) => {
              setIsLoading(true);
              const options = {
                limit: query.pageSize,
                skip: query.page * query.pageSize,
                page: query.page,
                sort: query.orderBy
                  ? {
                      [query.orderBy.field]: query.orderDirection,
                    }
                  : undefined,
              };
              ipcRenderer
                .invoke('find', {
                  name: dataState.name,
                  filter: {
                    ...query.filters.reduce((r, v) => {
                      if (typeof v.value === 'object' && v.value.length === 0) {
                        //  nothing
                      } else {
                        r[v.column.field] = v.value;
                      }
                      return r;
                    }, {}),
                  },
                  options,
                })
                .then((results) => {
                  setIsLoading(false);
                  resolve({
                    ...results,
                  });
                })
                .catch(reject);
            })
          }
          onChangeRowsPerPage={handleChangeRowsPerPage}
          actions={[
            {
              icon: 'add',
              tooltip: t('Add'),
              isFreeAction: true,
              onClick: () => {
                setSelected([]);
                handleClickDetailOpen();
              },
            },
            {
              tooltip: t('Edit Selected Rows'),
              icon: 'edit',
              onClick: (event, rows) => {
                log.info(`You want to edit ${rows.length} rows`);
                setSelected(rows);
                handleClickDetailOpen();
              },
            },
            {
              tooltip: t('Remove Selected Rows'),
              icon: 'delete',
              onClick: (event, rows) => {
                log.info(`You want to delete ${rows.length} rows`);
                handleSnackbarClick();
                setSelected(rows);
                ipcRenderer
                  .invoke('remove', {
                    name: dataState.name,
                    filter: {
                      _id: {
                        $in: rows.map((r) => r._id),
                      },
                    },
                  })
                  .then((results) => {
                    tableRef.current && tableRef.current.onQueryChange();
                    log.info(results);
                  })
                  .catch((e) => {
                    alert(e.toString());
                  });
              },
            },
          ]}
        />
      )}
      <DetailDialog
        open={detailOpen}
        onClose={handleDetailClose}
        list={selected}
        onChange={tableRef.current && tableRef.current.onQueryChange}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {t('deleted')}
        </Alert>
      </Snackbar>
    </>
  );
}
