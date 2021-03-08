import * as classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import * as _ from 'lodash';
import {
  ActionGroup,
  Button,
  FormGroup,
  Form,
  TextInput,
  Tooltip,
  InputGroup,
} from '@patternfly/react-core';
import {
  ButtonBar,
  Dropdown,
  Firehose,
  HandlePromiseProps,
  withHandlePromise,
} from '@console/internal/components/utils';
import {
  apiVersionForModel,
  k8sCreate,
  referenceForModel,
  K8sResourceKind,
} from '@console/internal/module/k8s';
import { ModalComponentProps } from '@console/internal/components/factory';
import { ResourceDropdown, getAPIVersion, getName } from '@console/shared';
import { SecretModel } from '@console/internal/models';
import { SecretType } from '@console/internal/components/secrets/create-secret';
import { history } from '@console/internal/components/utils/router';
import { CEPH_STORAGE_NAMESPACE } from '@console/ceph-storage-plugin/src/constants';
import { NooBaaNamespaceStoreModel } from '../../models';
import './create-ns.scss';
import {
  BC_PROVIDERS,
  AWS_REGIONS,
  NOOBAA_TYPE_MAP,
  PROVIDERS_NOOBAA_MAP,
  BUCKET_LABEL_NOOBAA_MAP,
} from '../../constants';

const PROVIDERS = (() => {
  const values = Object.values(BC_PROVIDERS).filter(
    (provider) => provider !== BC_PROVIDERS.GCP && provider !== BC_PROVIDERS.PVC,
  );
  return _.zipObject(values, values);
})();

const awsRegionItems = _.zipObject(AWS_REGIONS, AWS_REGIONS);
const externalProviders = [BC_PROVIDERS.AWS, BC_PROVIDERS.AZURE, BC_PROVIDERS.S3, BC_PROVIDERS.IBM];
const endpointSupported = [BC_PROVIDERS.S3, BC_PROVIDERS.IBM];

/**
 * aws-s3, s3 compatible, IBM COS share the same form
 */
const S3EndPointType: React.FC<S3EndpointTypeProps> = (props) => {
  const { t } = useTranslation();

  const [showSecret, setShowSecret] = React.useState(true);
  const { provider, namespace, state, dispatch } = props;

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
          className="nb-ns-form-entry"
          isRequired
        >
          <Dropdown
            className="nb-ns-form-entry__dropdown"
            menuClassName="nb-ns-form-entry__dropdown--short"
            buttonClassName="nb-ns-form-entry__dropdown"
            dataTest="namespacestore-aws-region-dropdown"
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
          className="nb-ns-form-entry"
          isRequired
        >
          <TextInput
            data-test="namespacestore-s3-endpoint"
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
          className="nb-ns-form-entry nb-ns-form-entry--full-width"
          isRequired
        >
          <InputGroup>
            <Firehose resources={resources}>
              <ResourceDropdown
                selectedKey={state.secretName}
                placeholder={t('noobaa-storage-plugin~Select Secret')}
                className="nb-ns-form-entry__dropdown nb-ns-form-entry__dropdown--full-width"
                buttonClassName="nb-ns-form-entry__dropdown"
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
                data-test="namespacestore-access-key"
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
            className="nb-ns-form-entry"
            label={credentialField2Label}
            fieldId="secret-key"
          >
            <TextInput
              value={state.secretKey}
              data-test="namespacestore-secret-key"
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
        className="nb-ns-form-entry"
        isRequired
      >
        <TextInput
          value={state.target}
          data-test="namespacestore-target-bucket"
          onChange={(e) => dispatch({ type: 'setTarget', value: e })}
          aria-label={targetLabel}
        />
      </FormGroup>
    </>
  );
};

type ProviderDataState = {
  secretName: string;
  secretKey: string;
  accessKey: string;
  region: string;
  target: string;
  endpoint: string;
};

type Action =
  | { type: 'setSecretName'; value: string }
  | { type: 'setSecretKey'; value: string }
  | { type: 'setAccessKey'; value: string }
  | { type: 'setRegion'; value: string }
  | { type: 'setTarget'; value: string }
  | { type: 'setEndpoint'; value: string };

type NSPayload = {
  apiVersion: string;
  kind: string;
  metadata: {
    namespace: string;
    name: string;
  };
  spec: {
    type: string;
    ssl: boolean;
    [key: string]: any;
  };
};

const initialState: ProviderDataState = {
  secretName: '',
  secretKey: '',
  accessKey: '',
  region: AWS_REGIONS[0],
  target: '',
  endpoint: '',
};

const providerDataReducer = (state: ProviderDataState, action: Action) => {
  const { value } = action;
  switch (action.type) {
    case 'setSecretName':
      return Object.assign({}, state, { secretName: value });
    case 'setSecretKey':
      return Object.assign({}, state, { secretKey: value });
    case 'setAccessKey':
      return Object.assign({}, state, { accessKey: value });
    case 'setRegion':
      return Object.assign({}, state, { region: value });
    case 'setTarget':
      return Object.assign({}, state, { target: value });
    case 'setEndpoint':
      return Object.assign({}, state, { endpoint: value });
    default:
      return initialState;
  }
};

const secretPayloadCreator = (
  provider: string,
  namespace: string,
  secretName: string,
  field1: string,
  field2 = '',
) => {
  const payload = {
    apiVersion: getAPIVersion(SecretModel),
    kind: SecretModel.kind,
    stringData: {},
    metadata: {
      name: secretName,
      namespace,
    },
    type: SecretType.opaque,
  };

  switch (provider) {
    case BC_PROVIDERS.AZURE:
      payload.stringData = {
        AccountName: field1,
        AccountKey: field2,
      };
      break;
    case BC_PROVIDERS.IBM:
      payload.stringData = {
        IBM_COS_ACCESS_KEY_ID: field1,
        IBM_COS_SECRET_ACCESS_KEY: field2,
      };
      break;
    default:
      payload.stringData = {
        AWS_ACCESS_KEY_ID: field1,
        AWS_SECRET_ACCESS_KEY: field2,
      };
      break;
  }
  return payload;
};

const CreateNamespaceStoreForm: React.FC<CreateNamespaceStoreFormProps> = withHandlePromise<
  CreateNamespaceStoreFormProps & HandlePromiseProps
>((props) => {
  const { t } = useTranslation();
  const [nsName, setNsName] = React.useState('');
  const [provider, setProvider] = React.useState(BC_PROVIDERS.AWS);
  const [providerDataState, providerDataDispatch] = React.useReducer(
    providerDataReducer,
    initialState,
  );

  const handleNsNameTextInputChange = (strVal: string) => {
    if (strVal.length <= 43) {
      setNsName(strVal);
    }
  };

  const {
    cancel,
    className,
    close,
    inProgress,
    errorMessage,
    handlePromise,
    isPage,
    csv,
    namespace,
  } = props;

  const onSubmit = (event) => {
    event.preventDefault();
    /** Create a secret if secret ==='' */
    let { secretName } = providerDataState;
    const promises = [];
    if (!secretName) {
      secretName = nsName.concat('-secret');
      const { secretKey, accessKey } = providerDataState;
      const secretPayload = secretPayloadCreator(
        provider,
        namespace,
        secretName,
        accessKey,
        secretKey,
      );
      providerDataDispatch({ type: 'setSecretName', value: secretName });
      promises.push(k8sCreate(SecretModel, secretPayload));
    }
    /** Payload for ns */
    const nsPayload: NSPayload = {
      apiVersion: apiVersionForModel(NooBaaNamespaceStoreModel),
      kind: NooBaaNamespaceStoreModel.kind,
      metadata: {
        namespace,
        name: nsName,
      },
      spec: {
        type: NOOBAA_TYPE_MAP[provider],
        ssl: false,
      },
    };
    if (externalProviders.includes(provider)) {
      nsPayload.spec = {
        ...nsPayload.spec,
        [PROVIDERS_NOOBAA_MAP[provider]]: {
          [BUCKET_LABEL_NOOBAA_MAP[provider]]: providerDataState.target,
          secret: {
            name: secretName,
            namespace,
          },
        },
      };
    }
    if (provider === BC_PROVIDERS.S3) {
      // eslint-disable-next-line
      nsPayload.spec['s3Compatible'] = {
        // eslint-disable-next-line
        ...nsPayload.spec['s3Compatible'],
        endpoint: providerDataState.endpoint,
      };
    } else if (provider === BC_PROVIDERS.IBM) {
      nsPayload.spec.ibmCos = { ...nsPayload.spec.ibmCos, endpoint: providerDataState.endpoint };
    }
    // Add region in the end
    if (provider === BC_PROVIDERS.AWS) {
      nsPayload.spec.awsS3 = { ...nsPayload.spec.awsS3, region: providerDataState.region };
    }

    promises.push(k8sCreate(NooBaaNamespaceStoreModel, nsPayload));
    return handlePromise(Promise.all(promises), (resource) => {
      const lastIndex = resource.length - 1;
      if (isPage)
        history.push(
          `/k8s/ns/${namespace}/clusterserviceversions/${getName(csv)}/${referenceForModel(
            NooBaaNamespaceStoreModel,
          )}/${getName(resource[lastIndex])}`,
        );
      else close();
    });
  };

  return (
    <Form className={classNames('nb-ns-form', className)} onSubmit={onSubmit}>
      <FormGroup
        label={t('noobaa-storage-plugin~Namespace Store Name')}
        fieldId="namespacestore-name"
        className="nb-ns-form-entry"
        helperText={t(
          'noobaa-storage-plugin~A unique name for the namespace store within the project',
        )}
        isRequired
      >
        <Tooltip
          content="Name can contain a max of 43 characters"
          isVisible={nsName.length > 42}
          trigger="manual"
        >
          <TextInput
            onChange={handleNsNameTextInputChange}
            value={nsName}
            maxLength={43}
            data-test="namespacestore-name"
            placeholder="my-namespacestore"
            aria-label={t('noobaa-storage-plugin~Namespace Store Name')}
          />
        </Tooltip>
      </FormGroup>

      <FormGroup
        label={t('noobaa-storage-plugin~Provider')}
        fieldId="provider-name"
        className="nb-ns-form-entry"
        isRequired
      >
        <Dropdown
          className="nb-ns-form-entry__dropdown"
          buttonClassName="nb-ns-form-entry__dropdown"
          dataTest="namespacestore-provider"
          onChange={setProvider}
          items={PROVIDERS}
          selectedKey={provider}
        />
      </FormGroup>
      {(provider === BC_PROVIDERS.AWS ||
        provider === BC_PROVIDERS.S3 ||
        provider === BC_PROVIDERS.IBM ||
        provider === BC_PROVIDERS.AZURE) && (
        <S3EndPointType
          provider={provider}
          namespace={CEPH_STORAGE_NAMESPACE}
          state={providerDataState}
          dispatch={providerDataDispatch}
        />
      )}
      <ButtonBar errorMessage={errorMessage} inProgress={inProgress}>
        <ActionGroup>
          <Button type="submit" data-test="namespacestore-create-button" variant="primary">
            {t('noobaa-storage-plugin~Create')}
          </Button>
          <Button onClick={cancel} variant="secondary">
            {t('noobaa-storage-plugin~Cancel')}
          </Button>
        </ActionGroup>
      </ButtonBar>
    </Form>
  );
});

export default CreateNamespaceStoreForm;

type CreateNamespaceStoreFormProps = ModalComponentProps & {
  isPage?: boolean;
  namespace?: string;
  className?: string;
  csv?: K8sResourceKind;
};

type S3EndpointTypeProps = {
  state: ProviderDataState;
  dispatch: React.Dispatch<Action>;
  provider: BC_PROVIDERS;
  namespace: string;
};
