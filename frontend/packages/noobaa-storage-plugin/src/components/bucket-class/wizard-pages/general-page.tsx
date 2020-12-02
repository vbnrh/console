import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Form,
  FormGroup,
  TextArea,
  TextInput,
  Radio,
} from '@patternfly/react-core';
import { ExternalLink } from '@console/internal/components/utils';
import { Action, State, BucketClassType } from '../state';

const GeneralPage: React.FC<GeneralPageProps> = ({ dispatch, state }) => {
  const [showHelp, setShowHelp] = React.useState(true);
  const onChange = (value: string) => {
    dispatch({ type: 'setBucketClassName', name: value });
  };
  const { bucketClassType } = state;

  return (
    <div className="nb-create-bc-step-page">
      {showHelp && (
        <Alert
          isInline
          variant="info"
          title="What is a Bucket Class?"
          className="nb-create-bc-step-page__info"
          actionClose={<AlertActionCloseButton onClose={() => setShowHelp(false)} />}
        >
          <p>
            A set of policies which would apply to all buckets (OBCs) created with the specific
            bucket class. These policies includes: placement, namespace, caching
          </p>
          <ExternalLink
            href="https://github.com/noobaa/noobaa-operator/blob/master/doc/bucket-class-crd.md"
            text="Learn More"
          />
        </Alert>
      )}
      <Form className="nb-create-bc-step-page-form">
        <FormGroup
          isRequired
          className="nb-create-bc-step-page-form__element"
          fieldId="bucketclasstype-input"
          label="Bucket Class Type"
        >
          <Radio
            name="bucket-class-type-selector"
            id="bucket-class-type-standard"
            isChecked={bucketClassType.length === 0 || bucketClassType === BucketClassType.STANDARD}
            onChange={() =>
              dispatch({ type: 'setBucketClassType', name: BucketClassType.STANDARD })
            }
            defaultChecked
            label="Standard"
            description="Data will be ingested by Multi-cloud object gateway, deduped, compressed and encrypted. The encrypted chunks would  be saved on the selected backing stores. Best used when the applications would always use the OpenShift Container Storage endpoints to access the data."
          />
          <Radio
            name="bucket-class-type-selector"
            id="bucket-class-type-namespace"
            isChecked={bucketClassType === BucketClassType.NAMESPACE}
            onChange={() =>
              dispatch({ type: 'setBucketClassType', name: BucketClassType.NAMESPACE })
            }
            label="Namespace"
            description="Data will stored as is(no dedup, compression, encryption) on the namespace stores. Namespace buckets allows for connecting to existing data and serving from them. Best used for existing data or when other applicatons (and native cloud services) need to access the data from outside the OpenShift Container Storage."
          />
        </FormGroup>
        <FormGroup
          isRequired
          className="nb-create-bc-step-page-form__element"
          fieldId="bucketclassname-input"
          label="Bucket Class Name"
          helperText="A unique name for the Bucket Class within the project."
        >
          <TextInput
            placeholder="my-multi-cloud-mirror"
            type="text"
            value={state.bucketClassName}
            onChange={onChange}
            aria-label="Bucket Class Name"
          />
        </FormGroup>
        <FormGroup
          className="nb-create-bc-step-page-form__element"
          fieldId="bc-description"
          label="Description(Optional)"
        >
          <TextArea
            value={state.description}
            onChange={(data) => dispatch({ type: 'setDescription', value: data })}
            aria-label="Description of bucket class"
          />
        </FormGroup>
      </Form>
    </div>
  );
};

export default GeneralPage;

type GeneralPageProps = {
  dispatch: React.Dispatch<Action>;
  state: State;
};
