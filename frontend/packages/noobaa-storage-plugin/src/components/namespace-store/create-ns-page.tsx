import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router';
import { Title } from '@patternfly/react-core';
import { history } from '@console/internal/components/utils/router';
import { BreadCrumbs, resourcePathFromModel } from '@console/internal/components/utils';
import { ClusterServiceVersionModel } from '@console/operator-lifecycle-manager/src/models';
import { ClusterServiceVersionKind } from '@console/operator-lifecycle-manager';
import CreateNamespaceStoreForm from './create-ns';
import './create-ns.scss';
import { useK8sGet } from '@console/internal/components/utils/k8s-get-hook';
import { ListKind } from 'public/module/k8s/types';

const CreateNamespaceStoreFormPage: React.FC<CreateNamespaceStoreFormPageProps> = ({ match }) => {
  const { t } = useTranslation();
  const { ns, appName } = match.params;
  const [csv, csvLoaded, csvErr] = useK8sGet<ListKind<ClusterServiceVersionKind>>(
    ClusterServiceVersionModel,
    '',
    ns,
  );
  const clusterServiceVersion = csvLoaded && !csvErr ? csv.items[0] : null;
  const onCancel = () => {
    history.goBack();
  };

  return (
    <>
      <div className="co-create-operand__header">
        <div className="co-create-operand__header-buttons">
          <BreadCrumbs
            breadcrumbs={[
              {
                name:
                  clusterServiceVersion?.spec?.displayName ||
                  'Openshift Container Storage Operator',
                path: resourcePathFromModel(ClusterServiceVersionModel, appName, ns),
              },
              { name: t('noobaa-storage-plugin~Create Namespace Store'), path: match.url },
            ]}
          />
        </div>
        <div className="nb-ns-page-title">
          <Title size="2xl" headingLevel="h1" className="nb-ns-page-title__main">
            {t('noobaa-storage-plugin~Create Namespace Store')}
          </Title>
          <p className="nb-ns-page-title__info">
            {t(
              'noobaa-storage-plugin~Represents an underlying storage to be used as read or write target for the data in the namespace buckets.',
            )}
          </p>
        </div>
      </div>
      <div className="nb-ns-page">
        <CreateNamespaceStoreForm
          cancel={onCancel}
          isPage
          namespace={ns}
          className="nb-ns-page-form__short"
          csv={clusterServiceVersion}
        />
      </div>
    </>
  );
};

type CreateNamespaceStoreFormPageProps = RouteComponentProps<{ ns?: string; appName?: string }>;

export default CreateNamespaceStoreFormPage;
