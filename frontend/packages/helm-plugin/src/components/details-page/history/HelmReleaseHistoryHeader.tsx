import { TFunction } from 'i18next';
import { sortable } from '@patternfly/react-table';
import { Kebab } from '@console/internal/components/utils';

export const tableColumnClasses = {
  revision: 'col-lg-1 col-md-3 col-sm-3 col-xs-3',
  updated: 'col-lg-2 col-md-3 col-sm-5 col-xs-5',
  status: 'col-lg-1 col-md-2 hidden-sm hidden-xs',
  chartName: 'col-lg-2 hidden-md hidden-sm hidden-xs',
  chartVersion: 'col-lg-2 hidden-md hidden-sm hidden-xs',
  appVersion: 'col-lg-2 hidden-md hidden-sm hidden-xs',
  description: 'col-lg-2 hidden-md hidden-sm hidden-xs',
  kebab: Kebab.columnClass,
};

const HelmReleaseHistoryHeader = (t: TFunction) => () => {
  return [
    {
      title: t('helm-plugin~Revision'),
      sortField: 'version',
      transforms: [sortable],
      props: { className: tableColumnClasses.revision },
    },
    {
      title: t('helm-plugin~Updated'),
      sortField: 'info.last_deployed',
      transforms: [sortable],
      props: { className: tableColumnClasses.updated },
    },
    {
      title: t('helm-plugin~Status'),
      sortField: 'info.status',
      transforms: [sortable],
      props: { className: tableColumnClasses.status },
    },
    {
      title: t('helm-plugin~Chart name'),
      sortField: 'chart.metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses.chartName },
    },
    {
      title: t('helm-plugin~Chart version'),
      sortField: 'chart.metadata.version',
      transforms: [sortable],
      props: { className: tableColumnClasses.chartVersion },
    },
    {
      title: t('helm-plugin~App version'),
      sortField: 'chart.metadata.appVersion',
      transforms: [sortable],
      props: { className: tableColumnClasses.appVersion },
    },
    {
      title: t('helm-plugin~Description'),
      props: { className: tableColumnClasses.description },
    },
    {
      title: '',
      props: { className: tableColumnClasses.kebab },
    },
  ];
};

export default HelmReleaseHistoryHeader;
