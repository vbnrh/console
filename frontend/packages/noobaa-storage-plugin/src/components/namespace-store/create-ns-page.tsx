import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ClusterServiceVersionModel } from '@console/operator-lifecycle-manager';
import { k8sGet } from '@console/internal/module/k8s';
import { BreadCrumbs, resourcePathFromModel } from '@console/internal/components/utils';
import { NooBaaNamespaceStoreModel } from '../../models';
import { Title } from '@patternfly/react-core';
import './create-ns.scss';
import CreateNamespaceStoreForm from './create-ns-form';
import { history } from '@console/internal/components/utils/router';

const CreateNamespaceStorePage: React.FC<CreateNSProps> = ({ match }) => {
  const { ns, appName } = match.params;
  const [clusterServiceVersion, setClusterServiceVersion] = React.useState(null);
  const onCancel = () => {
    history.goBack();
  };

  React.useEffect(() => {
    k8sGet(ClusterServiceVersionModel, appName, ns)
      .then((clusterServiceVersionObj) => {
        setClusterServiceVersion(clusterServiceVersionObj);
      })
      .catch(() => setClusterServiceVersion(null));
  }, [appName, ns]);

  return (
    <>
      <div className="co-create-operand__header">
        <div className="co-create-operand__header-buttons">
          <BreadCrumbs
            breadcrumbs={[
              {
                name: _.get(
                  clusterServiceVersion,
                  'spec.displayName',
                  'Openshift Container Storage Operator',
                ),
                path: resourcePathFromModel(ClusterServiceVersionModel, appName, ns),
              },
              { name: `Create ${NooBaaNamespaceStoreModel.label}`, path: match.url },
            ]}
          />
        </div>
        <div className="nb-ns-page-title">
          <Title size="2xl" headingLevel="h1" className="nb-ns-page-title__main">
            Create new Namespace Store
          </Title>
          <p className="nb-ns-page-title__info">
            Represents an underlying storage to be used as read or write target for the data in
            namespace buckets
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

type CreateNSProps = RouteComponentProps<{ ns?: string; appName?: string }>;

export default CreateNamespaceStorePage;
