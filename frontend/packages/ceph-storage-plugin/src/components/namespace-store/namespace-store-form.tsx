import * as classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { ActionGroup, Button, FormGroup, Form, TextInput, Tooltip } from '@patternfly/react-core';
import {
  ButtonBar,
  Dropdown,
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
import { getName } from '@console/shared';
import { SecretModel } from '@console/internal/models';
import { history } from '@console/internal/components/utils/router';
import { CEPH_STORAGE_NAMESPACE } from '@console/ceph-storage-plugin/src/constants';
import { NooBaaNamespaceStoreModel } from '../../models';
import {
  BC_PROVIDERS,
  AWS_REGIONS,
  NOOBAA_TYPE_MAP,
  PROVIDERS_NOOBAA_MAP,
  BUCKET_LABEL_NOOBAA_MAP,
} from '../../constants';
import {
  getExternalProviders,
  StoreType,
  getProviders,
  secretPayloadCreator,
} from '../../utils/noobaa-utils';
import { Payload, ProviderDataState, StoreAction } from '../../types';
import '../endpoints/endpoints.scss';
import { S3EndPointType } from '../endpoints/s3-endpoint-type';

const PROVIDERS = getProviders(StoreType.NS);
const externalProviders = getExternalProviders(StoreType.NS);

const initialState: ProviderDataState = {
  secretName: '',
  secretKey: '',
  accessKey: '',
  region: AWS_REGIONS[0],
  target: '',
  endpoint: '',
};

const providerDataReducer = (state: ProviderDataState, action: StoreAction) => {
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

const NamespaceStoreForm: React.FC<NamespaceStoreFormProps> = withHandlePromise<
  NamespaceStoreFormProps & HandlePromiseProps
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
    const nsPayload: Payload = {
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
    <Form className={classNames('nb-bs-ns-form', className)} onSubmit={onSubmit} noValidate={false}>
      <FormGroup
        label={t('ceph-storage-plugin~Namespace Store Name')}
        fieldId="namespacestore-name"
        className="nb-bs-ns-form-entry"
        helperText={t(
          'ceph-storage-plugin~A unique name for the namespace store within the project',
        )}
        isRequired
      >
        <Tooltip
          content="Name can contain a max of 43 characters"
          isVisible={nsName.length > 42}
          trigger="manual"
        >
          <TextInput
            id="ns-name"
            onChange={handleNsNameTextInputChange}
            value={nsName}
            maxLength={43}
            data-test="namespacestore-name"
            placeholder="my-namespacestore"
            aria-label={t('ceph-storage-plugin~Namespace Store Name')}
          />
        </Tooltip>
      </FormGroup>

      <FormGroup
        label={t('ceph-storage-plugin~Provider')}
        fieldId="provider-name"
        className="nb-bs-ns-form-entry"
        isRequired
      >
        <Dropdown
          id="providers"
          className="nb-bs-ns-form-entry__dropdown"
          buttonClassName="nb-bs-ns-form-entry__dropdown"
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
          type={StoreType.NS}
          provider={provider}
          namespace={CEPH_STORAGE_NAMESPACE}
          state={providerDataState}
          dispatch={providerDataDispatch}
        />
      )}
      <ButtonBar errorMessage={errorMessage} inProgress={inProgress}>
        <ActionGroup>
          <Button type="submit" data-test="namespacestore-create-button" variant="primary">
            {t('ceph-storage-plugin~Create')}
          </Button>
          <Button onClick={cancel} variant="secondary">
            {t('ceph-storage-plugin~Cancel')}
          </Button>
        </ActionGroup>
      </ButtonBar>
    </Form>
  );
});

export default NamespaceStoreForm;

type NamespaceStoreFormProps = ModalComponentProps & {
  isPage?: boolean;
  namespace: string;
  className?: string;
  csv?: K8sResourceKind;
};
