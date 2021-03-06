import React, { useState, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { get } from 'lodash-es';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Uppy from '@uppy/core';
import Transloadit from '@uppy/transloadit';
import DashboardModal from '@uppy/react/lib/DashboardModal';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import {
  transloaditKey,
  transloaditTemplateId,
  transloaditService,
} from '../../constants/apiKeys';
import DeleteButton from '../DeleteButton';

export default function FileInput({
  schema,
  value,
  onChange,
  dark = false,
  minimalLabels = false, // eslint-disable-line no-unused-vars
  ...rest
}) {
  const intl = useIntl();
  const [uppy, setUppy] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const uppyInstance = Uppy({
      meta: { type: 'test' },
      restrictions: {
        maxNumberOfFiles: 100,
        maxFileSize: 10000000, // 10 MB
        allowedFileTypes: schema.allowedFileTypes || null,
      },
      autoProceed: true,
    });

    uppyInstance.use(Transloadit, {
      service: transloaditService,
      params: {
        auth: { key: transloaditKey },
        template_id: transloaditTemplateId,
      },
      waitForEncoding: false,
      waitForMetadata: false,
      importFromUploadURLs: false,
      alwaysRunAssembly: false,
      signature: null,
      fields: {},
      limit: 0,
    });

    uppyInstance.on('complete', uppyState => {
      const uploadObject = get(uppyState, 'successful.0');
      if (uploadObject) onChange(uploadObject);
    });

    setUppy(uppyInstance);

    return () => uppyInstance.close();
  }, []);

  const allowedFileTypeString = schema.allowedFileTypes
    ? schema.allowedFileTypes.join(', ')
    : null;

  return (
    <div>
      {!value && (
        <Button
          size="small"
          variant="outlined"
          style={{ marginTop: 16 }}
          onClick={() => setModalOpen(true)}
          {...rest}
        >
          <FormattedMessage id="UPLOAD_A_FILE" />
        </Button>
      )}
      {value && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {get(value, 'type', '').includes('image') && (
            <img
              alt="Uploaded media"
              style={{
                maxHeight: 120,
                maxWidth: 120,
                height: 'auto',
                width: 'auto',
                padding: 20,
                backgroundColor: dark ? '#1f2640' : 'unset',
              }}
              src={get(value, 'response.uploadURL', null)}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography>{value.name}</Typography>
            <DeleteButton
              onClick={() => {
                onChange(null);
                uppy.reset();
              }}
            />
          </div>
        </div>
      )}
      {uppy && (
        <DashboardModal
          uppy={uppy}
          note={
            allowedFileTypeString
              ? intl.formatMessage(
                  { id: 'FILETYPES_NOTE' },
                  { allowedFileTypes: allowedFileTypeString },
                )
              : null
          }
          closeAfterFinish
          closeModalOnClickOutside
          showProgressDetails
          showLinkToFileUploadResult={false}
          open={modalOpen}
          onRequestClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
