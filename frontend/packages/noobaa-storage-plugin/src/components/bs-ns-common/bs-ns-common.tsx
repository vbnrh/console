import * as React from 'react';
import {
    BC_PROVIDERS,
    AWS_REGIONS,
  } from '../../constants';
import * as _ from 'lodash';
import {
Dropdown,
Firehose
} from '@console/internal/components/utils';
import { useTranslation } from 'react-i18next';
import {
    Button,
    FormGroup,
    TextInput,
    InputGroup,
} from '@patternfly/react-core';
import { SecretModel } from '@console/internal/models';
import { ResourceDropdown} from '@console/shared';
import './create-bs-ns.scss'

export enum StoreType {
    BS = 'BackingStore',
    NS = 'NamespaceStore'
}
export const awsRegionItems = _.zipObject(AWS_REGIONS, AWS_REGIONS);
export const endpointSupported = [BC_PROVIDERS.S3, BC_PROVIDERS.IBM];
export const getProviders = (type: StoreType) => {
    const values = type == StoreType.BS ? Object.values(BC_PROVIDERS) : Object.values(BC_PROVIDERS).filter(
        (provider) => provider !== BC_PROVIDERS.GCP && provider !== BC_PROVIDERS.PVC,
      );
    return _.zipObject(values, values);
}

export const getExternalProviders = (type: StoreType) => {
    return type == StoreType.NS ?  [
        BC_PROVIDERS.AWS,
        BC_PROVIDERS.AZURE,
        BC_PROVIDERS.S3,
        BC_PROVIDERS.IBM,
      ] : [
        BC_PROVIDERS.AWS,
        BC_PROVIDERS.AZURE,
        BC_PROVIDERS.S3,
        BC_PROVIDERS.GCP,
        BC_PROVIDERS.IBM,
      ];
}

type Action =
  | { type: 'setSecretName'; value: string }
  | { type: 'setSecretKey'; value: string }
  | { type: 'setAccessKey'; value: string }
  | { type: 'setRegion'; value: string }
  | { type: 'setGcpJSON'; value: string }
  | { type: 'setTarget'; value: string }
  | { type: 'setEndpoint'; value: string }
  | { type: 'setVolumes'; value: number }
  | { type: 'setVolumeSize'; value: string }
  | { type: 'setStorageClass'; value: string };
  
type ProviderDataState = {
    secretName: string;
    secretKey: string;
    accessKey: string;
    region: string;
    gcpJSON: string;
    target: string;
    endpoint: string;
    numVolumes: number;
    volumeSize: string;
    storageClass: string;
  };


type S3EndpointTypeProps = {
    type: StoreType;
    state: ProviderDataState;
    dispatch: React.Dispatch<Action>;
    provider: BC_PROVIDERS;
    namespace: string;
  };

export const S3EndPointType: React.FC<S3EndpointTypeProps> = (props) => {
    const { t } = useTranslation();
  
    const [showSecret, setShowSecret] = React.useState(true);
    const { provider, namespace, state, dispatch, type } = props;
  
    const targetLabel =
      provider === BC_PROVIDERS.AZURE
        ? t('noobaa-storage-plugin~Target Blob Container')
        : t('noobaa-storage-plugin~Target Bucket');
    const credentialField1Label =
      provider === BC_PROVIDERS.AZURE
        ? t('noobaa-storage-plugin~Account Name')
        : t('noobaa-storage-plugin~Access Key');
    const credentialField2Label =
      provider === BC_PROVIDERS.AZURE
        ? t('noobaa-storage-plugin~Account Key')
        : t('noobaa-storage-plugin~Secret Key');
    const resources = [
      {
        isList: true,
        namespace,
        kind: SecretModel.kind,
        prop: 'secrets',
      },
    ];
  
    const switchToSecret = () => {
      setShowSecret(true);
      dispatch({ type: 'setAccessKey', value: '' });
      dispatch({ type: 'setSecretKey', value: '' });
    };
  
    const switchToCredentials = () => {
      setShowSecret(false);
      dispatch({ type: 'setSecretName', value: '' });
    };
  
    return (
      <>
        {provider === BC_PROVIDERS.AWS && (
          <FormGroup
            label={t('noobaa-storage-plugin~Region')}
            fieldId="region"
            className="nb-bs-ns-form-entry"
            isRequired
          >
            <Dropdown
              className="nb-bs-ns-form-entry__dropdown"
              menuClassName="nb-bs-ns-form-entry__dropdown--short"
              buttonClassName="nb-bs-ns-form-entry__dropdown"
              dataTest={`${type.toLowerCase()}-aws-region-dropdown`}
              onChange={(e) => {
                dispatch({ type: 'setRegion', value: e });
              }}
              items={awsRegionItems}
              selectedKey={AWS_REGIONS[0]}
              aria-label={t('noobaa-storage-plugin~Region Dropdown')}
            />
          </FormGroup>
        )}
  
        {endpointSupported.includes(provider) && (
          <FormGroup
            label={t('noobaa-storage-plugin~Endpoint')}
            fieldId="endpoint"
            className="nb-bs-ns-form-entry"
            isRequired
          >
            <TextInput
              data-test={`${type.toLowerCase()}-s3-endpoint`}
              onChange={(e) => {
                dispatch({ type: 'setEndpoint', value: e });
              }}
              value={state.endpoint}
              aria-label={t('noobaa-storage-plugin~Endpoint Address')}
            />
          </FormGroup>
        )}
  
        {showSecret ? (
          <FormGroup
            label={t('noobaa-storage-plugin~Secret')}
            fieldId="secret-dropdown"
            className="nb-bs-ns-form-entry nb-bs-ns-form-entry--full-width"
            isRequired
          >
            <InputGroup>
              <Firehose resources={resources}>
                <ResourceDropdown
                  selectedKey={state.secretName}
                  placeholder={t('noobaa-storage-plugin~Select Secret')}
                  className="nb-bs-ns-form-entry__dropdown nb-bs-ns-form-entry__dropdown--full-width"
                  buttonClassName="nb-bs-ns-form-entry__dropdown"
                  dataSelector={['metadata', 'name']}
                  onChange={(e) => dispatch({ type: 'setSecretName', value: e })}
                />
              </Firehose>
              <Button variant="plain" data-test="switch-to-creds" onClick={switchToCredentials}>
                {t('noobaa-storage-plugin~Switch to Credentials')}
              </Button>
            </InputGroup>
          </FormGroup>
        ) : (
          <>
            <FormGroup label={credentialField1Label} fieldId="acess-key">
              <InputGroup>
                <TextInput
                  data-test={`${type.toLowerCase()}-access-key`}
                  value={state.accessKey}
                  onChange={(e) => {
                    dispatch({ type: 'setAccessKey', value: e });
                  }}
                  aria-label={t('noobaa-storage-plugin~Access Key Field')}
                />
                <Button variant="plain" onClick={switchToSecret}>
                  {t('noobaa-storage-plugin~Switch to Secret')}
                </Button>
              </InputGroup>
            </FormGroup>
            <FormGroup
              className="nb-bs-ns-form-entry"
              label={credentialField2Label}
              fieldId="secret-key"
            >
              <TextInput
                value={state.secretKey}
                data-test={`${type.toLowerCase()}-secret-key`}
                onChange={(e) => {
                  dispatch({ type: 'setSecretKey', value: e });
                }}
                aria-label={t('noobaa-storage-plugin~Secret Key Field')}
                type="password"
              />
            </FormGroup>
          </>
        )}
        <FormGroup
          label={targetLabel}
          fieldId="target-bucket"
          className="nb-bs-ns-form-entry"
          isRequired
        >
          <TextInput
            value={state.target}
            data-test={`${type.toLowerCase()}-target-bucket`}
            onChange={(e) => dispatch({ type: 'setTarget', value: e })}
            aria-label={targetLabel}
          />
        </FormGroup>
      </>
    );
  };


  