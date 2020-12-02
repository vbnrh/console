import * as React from 'react';
import { Alert, AlertActionCloseButton, Button, Radio, Title, Form } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { PlacementPolicy } from '../../../types';
import { Action, State, BucketClassType, NamespacePolicyType } from '../state';

const PlacementPolicyPage: React.FC<PlacementPolicyPageProps> = ({ dispatch, state }) => {
  const { tier1Policy, tier2Policy, bucketClassType, namespacePolicyType } = state;
  const [showHelp, setShowHelp] = React.useState(true);
  const showTier2 = !!tier2Policy;
  const isNamespaceBucketClassType = bucketClassType === BucketClassType.NAMESPACE;
  const onChange = (checked: boolean, event) => {
    const { name, value } = event.target;
    if (name === 'placement-policy-1') {
      dispatch({ type: 'setPlacementPolicyTier1', value });
    } else if (name === 'placement-policy-2') {
      dispatch({ type: 'setPlacementPolicyTier2', value });
    }
  };

  const handlePolicyTypeChange = (checked: boolean, event) => {
    dispatch({ type: 'setNamespacePolicyType', name: event.target.value });
  };
  return (
    <div className="nb-create-bc-step-page">
      {showHelp && !isNamespaceBucketClassType && (
        <Alert
          isInline
          variant="info"
          title="What is a Placement Policy?"
          className="nb-create-bc-step-page__info"
          actionClose={<AlertActionCloseButton onClose={() => setShowHelp(false)} />}
        >
          <p>
            Data placement capabilities are built as a multi-layer structure, here are the layers
            bottom-up:
          </p>
          <ul>
            <li>
              Spread Tier - list of backing-stores, aggregates the storage of multiple stores.
            </li>
            <li>
              Mirroring Tier - list of spread-layers, async-mirroring to all mirrors, with locality
              optimization (will allocate on the closest region to the source endpoint), mirroring
              requires at least two backing-stores.
            </li>
          </ul>
          The number of replicas can be configured via the NooBaa management console.
        </Alert>
      )}
      {showHelp && isNamespaceBucketClassType && (
        <Alert
          isInline
          variant="info"
          title="What is a Namespace Policy?"
          className="nb-create-bc-step-page__info"
          actionClose={<AlertActionCloseButton onClose={() => setShowHelp(false)} />}
        >
          <p>
            Namespace policy can be set to one single read and write source, multi read resurces or
            cached policy.
          </p>
        </Alert>
      )}
      {!isNamespaceBucketClassType && (
        <Form className="nb-create-bc-step-page-form">
          <Title size="xl" headingLevel="h2" className="nb-bc-step-page-form__title">
            Tier 1 - Policy Type
          </Title>
          <Radio
            value={PlacementPolicy.Spread}
            isChecked={tier1Policy === PlacementPolicy.Spread}
            onChange={onChange}
            id="radio-1"
            label={PlacementPolicy.Spread}
            name="placement-policy-1"
          />
          <p className="nb-create-bc-step-page-form__element--light-text">
            Spreading the data across the chosen resources. By default, a replica of one copy is
            used and does not include failure tolerance in case of resource failure.
          </p>
          <Radio
            value={PlacementPolicy.Mirror}
            isChecked={tier1Policy === PlacementPolicy.Mirror}
            onChange={onChange}
            id="radio-2"
            label={PlacementPolicy.Mirror}
            name="placement-policy-1"
          />
          <p className="nb-create-bc-step-page-form__element--light-text">
            Full duplication of the data in each chosen resource, By default, a replica of one copy
            per location is used. includes failure tolerance in case of resource failure.
          </p>
        </Form>
      )}
      {!showTier2 && !isNamespaceBucketClassType && (
        <Button
          variant="link"
          icon={<PlusCircleIcon />}
          onClick={() =>
            dispatch({ type: 'setPlacementPolicyTier2', value: PlacementPolicy.Spread })
          }
          isInline
          data-testid="add-tier-btn"
        >
          Add Tier
        </Button>
      )}
      {showTier2 && !isNamespaceBucketClassType && (
        <Form className="nb-create-bc-step-page-form">
          <Title headingLevel="h2" size="xl" className="nb-bc-step-page-form__title">
            Tier 2 - Policy type
            <Button
              variant="link"
              icon={<MinusCircleIcon />}
              onClick={() => dispatch({ type: 'setPlacementPolicyTier2', value: null })}
              isInline
            >
              Remove Tier
            </Button>
          </Title>
          <Radio
            value={PlacementPolicy.Spread}
            isChecked={tier2Policy === PlacementPolicy.Spread}
            onChange={onChange}
            id="radio-3"
            label={PlacementPolicy.Spread}
            name="placement-policy-2"
          />
          <p className="nb-create-bc-step-page-form__element--light-text">
            Spreading the data across the chosen resources does not includes failure tolerance in
            case of resource failure.
          </p>
          <Radio
            value={PlacementPolicy.Mirror}
            isChecked={tier2Policy === PlacementPolicy.Mirror}
            onChange={onChange}
            id="radio-4"
            label={PlacementPolicy.Mirror}
            name="placement-policy-2"
          />
          <p className="nb-create-bc-step-page-form__element--light-text">
            Full duplication of the data in each chosen resource, includes failure tolerance in
            cause of resource failure.
          </p>
        </Form>
      )}
      {isNamespaceBucketClassType && (
        <Form className="nb-create-bc-step-page-form">
          <Title size="xl" headingLevel="h2" className="nb-bc-step-page-form__title">
            Namespace Policy Type
          </Title>
          <Radio
            value={NamespacePolicyType.SINGLE}
            isChecked={namespacePolicyType === NamespacePolicyType.SINGLE}
            onChange={handlePolicyTypeChange}
            id="single-ns-store"
            label="Single namespace-store"
            name="single-namespace-store"
          />
          <p className="nb-create-bc-step-page-form__element--light-text">
            The namespace bucket will read and write its data to a selected namespace store
          </p>
          <Radio
            value={NamespacePolicyType.MULTI}
            isChecked={namespacePolicyType === NamespacePolicyType.MULTI}
            onChange={handlePolicyTypeChange}
            id="multi-ns-store"
            label="Multi namespace-stores"
            name="multi-namespace-stores"
          />
          <p className="nb-create-bc-step-page-form__element--light-text">
            The namespace bucket will serve reads from several selected backing stores, creating a
            virtual namespace on top of them and will write to one of those as its chosen write
            target
          </p>
          <Radio
            value={NamespacePolicyType.CACHE}
            isChecked={namespacePolicyType === NamespacePolicyType.CACHE}
            onChange={handlePolicyTypeChange}
            id="cache-ns-store"
            label="Cache namespace-store"
            name="cache-namespace-store"
          />
          <p className="nb-create-bc-step-page-form__element--light-text">
            The caching bucket will serve data from a large raw data out of a local caching tiering.
          </p>
        </Form>
      )}
    </div>
  );
};

export default PlacementPolicyPage;

type PlacementPolicyPageProps = {
  dispatch: React.Dispatch<Action>;
  state: State;
};
