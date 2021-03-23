import { useTranslation } from 'react-i18next';
import * as React from 'react';
import * as _ from 'lodash';
import { Button, FormGroup, TextInput, InputGroup, TextArea } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import { ExternalLink, Firehose } from '@console/internal/components/utils';
import { ResourceDropdown } from '@console/shared';
import { SecretModel } from '@console/internal/models';
import { DashboardCardPopupLink } from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardLink';
import { BackingStoreProviderDataState, BackingStoreAction } from '../../types';
import './endpoints.scss';

type GCPEndPointTypeProps = {
  state: BackingStoreProviderDataState;
  dispatch: React.Dispatch<BackingStoreAction>;
  namespace: string;
};

export const GCPEndpointType: React.FC<GCPEndPointTypeProps> = (props) => {
  const { t } = useTranslation();

  const [fileData, setFileData] = React.useState('');
  const [inputData, setInputData] = React.useState('');
  const [showSecret, setShowSecret] = React.useState(false);
  const { state, dispatch, namespace } = props;

  const resources = [
    {
      isList: true,
      namespace,
      kind: SecretModel.kind,
      prop: 'secrets',
    },
  ];

  const toggleShowSecret = () => setShowSecret((isShown) => !isShown);

  const gcpHelpText = (
    <DashboardCardPopupLink
      linkTitle={
        <>
          <HelpIcon />
          {t('ceph-storage-plugin~Where can I find google cloud credentials?')}
        </>
      }
      popupTitle=" "
    >
      <div>
        {t(
          'ceph-storage-plugin~Service account keys are needed for Google Cloud Storage authentication. The keys can be found in the service accounts page in the GCP console.',
        )}
        <ExternalLink
          href="https://cloud.google.com/iam/docs/service-accounts#service_account_keys"
          text={t('ceph-storage-plugin~Learn more')}
        />
      </div>
    </DashboardCardPopupLink>
  );

  const onUpload = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = _.get(ev, 'target.result');
      setFileData(data);
      setInputData(file.name);
      dispatch({ type: 'setGcpJSON', value: data });
    };
    reader.readAsText(file);
  };

  return (
    <>
      <FormGroup
        className="nb-bs-ns-form-entry"
        helperText={
          !showSecret
            ? t(
                'ceph-storage-plugin~Upload a .json file with the service account keys provided by google cloud storage.',
              )
            : null
        }
        label={t('ceph-storage-plugin~Secret Key')}
        fieldId="secret-key"
        isRequired
      >
        {!showSecret ? (
          <InputGroup>
            <TextInput
              isReadOnly
              value={inputData}
              className="nb-bs-ns-form-entry__file-name"
              placeholder={t('ceph-storage-plugin~Upload JSON')}
              aria-label={t('ceph-storage-plugin~Uploaded File Name')}
            />
            <div className="inputbtn nb-bs-ns-form-entry-upload-btn">
              <Button
                href="#"
                variant="secondary"
                className="custom-input-btn nb-bs-ns-form-entry-upload-btn__button"
                aria-label={t('ceph-storage-plugin~Upload File')}
              >
                {t('ceph-storage-plugin~Browse')}
              </Button>
              <input
                type="file"
                id="inputButton"
                className="nb-bs-ns-form-entry-upload-btn__input"
                onChange={onUpload}
                aria-label={t('ceph-storage-plugin~Upload File')}
              />
            </div>
            <Button
              variant="plain"
              onClick={toggleShowSecret}
              aria-label={t('ceph-storage-plugin~Switch to Secret')}
            >
              {t('ceph-storage-plugin~Switch to Secret')}
            </Button>
          </InputGroup>
        ) : (
          <InputGroup>
            <Firehose resources={resources}>
              <ResourceDropdown
                selectedKey={state.secretName}
                placeholder={t('ceph-storage-plugin~Select Secret')}
                className="nb-bs-ns-form-entry__dropdown nb-bs-ns-form-entry__dropdown--full-width"
                buttonClassName="nb-bs-ns-form-entry__dropdown"
                dataSelector={['metadata', 'name']}
                ariaLabel={t('ceph-storage-plugin~Select Secret')}
                onChange={(e) => dispatch({ type: 'setSecretName', value: e })}
              />
            </Firehose>
            <Button
              variant="plain"
              onClick={toggleShowSecret}
              aria-label={t('ceph-storage-plugin~Switch to upload JSON')}
            >
              {t('ceph-storage-plugin~Switch to upload JSON')}
            </Button>
          </InputGroup>
        )}
      </FormGroup>
      {!showSecret && (
        <FormGroup className="nb-bs-ns-form-entry" helperText={gcpHelpText} fieldId="gcp-data">
          <TextArea
            aria-label={t('ceph-storage-plugin~Cluster Metadata')}
            className="nb-bs-ns-form-entry__data-dump"
            value={fileData}
          />
        </FormGroup>
      )}
      <FormGroup
        className="nb-bs-ns-form-entry"
        label={t('ceph-storage-plugin~Target Bucket')}
        fieldId="target-bucket"
        isRequired
      >
        <TextInput
          value={state.target}
          onChange={(e) => {
            dispatch({ type: 'setTarget', value: e });
          }}
          aria-label={t('ceph-storage-plugin~Target Bucket')}
        />
      </FormGroup>
    </>
  );
};
