import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { some, values } from 'lodash-es';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Hidden from '@material-ui/core/Hidden';
import Grid from '@material-ui/core/Grid';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import BackIcon from '@material-ui/icons/KeyboardBackspace';
import {
  selectSightingSchema,
  selectSightingCategories,
} from '../../modules/sightings/selectors';
import { selectSiteName } from '../../modules/site/selectors';
import LabeledInput from '../../components/LabeledInput';
import AsyncButton from '../../components/AsyncButton';
import InlineButton from '../../components/InlineButton';
import BigExpansionPanel from '../../components/BigExpansionPanel';
import TermsAndConditionsDialog from './TermsAndConditionsDialog';

export default function StandardReport({ variant, onBack }) {
  const intl = useIntl();
  const categories = useSelector(selectSightingCategories);
  const schema = useSelector(selectSightingSchema);
  const siteName = useSelector(selectSiteName);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptEmails, setAcceptEmails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [incompleteFields, setIncompleteFields] = useState([]);
  const [termsError, setTermsError] = useState(false);
  const categoryList = values(categories);

  const [formValues, setFormValues] = useState(
    schema.reduce((memo, field) => {
      memo[field.name] = field.defaultValue;
      return memo;
    }, {}),
  );

  return (
    <Grid container direction="column">
      <TermsAndConditionsDialog
        visible={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
      <Grid item>
        <Button
          onClick={onBack}
          style={{ marginTop: 8 }}
          size="small"
          startIcon={<BackIcon />}
        >
          <FormattedMessage id="BACK_TO_PHOTOS" />
        </Button>
      </Grid>
      <Grid item>
        {categoryList.map(category => {
          const inputsInCategory = schema.filter(
            f => f.category === category.name,
          );
          const requiredCategory = some(
            inputsInCategory,
            input => input.required,
          );

          if (variant === 'multiple' && category.individualFields)
            return null;

          return (
            <BigExpansionPanel
              key={category.name}
              defaultExpanded={category.name === 'general'}
            >
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${
                  category.name
                }-filter-panel-content`}
                id={`${category.name}-filter-panel-header`}
              >
                <Typography variant="subtitle1">
                  {category.labelId ? (
                    <FormattedMessage id={category.labelId} />
                  ) : (
                    category.label
                  )}
                  {requiredCategory && ' *'}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {inputsInCategory.map(input => {
                    return (
                      <div
                        key={`${category.name} - ${input.name}`}
                        style={{
                          display: 'flex',
                          marginBottom: 12,
                        }}
                      >
                        <Hidden xsDown>
                          <Typography
                            style={{
                              marginRight: 16,
                              marginTop: 20,
                              width: 180,
                              textAlign: 'right',
                            }}
                          >
                            <FormattedMessage id={input.labelId} />
                            {input.required && ' *'}
                          </Typography>
                        </Hidden>
                        <LabeledInput
                          schema={input}
                          value={formValues[input.name]}
                          onChange={value => {
                            setFormValues({
                              ...formValues,
                              [input.name]: value,
                            });
                          }}
                          width={220}
                        />
                      </div>
                    );
                  })}
                </div>
              </ExpansionPanelDetails>
            </BigExpansionPanel>
          );
        })}
      </Grid>
      <Grid item>
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptEmails}
              onChange={() => setAcceptEmails(!acceptEmails)}
            />
          }
          label={
            <FormattedMessage
              id="ONE_SIGHTING_EMAIL_CONSENT"
              values={{ siteName }}
            />
          }
        />
      </Grid>
      <Grid item>
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptedTerms}
              onChange={() => setAcceptedTerms(!acceptedTerms)}
            />
          }
          label={
            <span>
              <FormattedMessage id="TERMS_CHECKBOX_1" />
              <InlineButton onClick={() => setDialogOpen(true)}>
                <FormattedMessage id="TERMS_CHECKBOX_2" />
              </InlineButton>
              <FormattedMessage id="END_OF_SENTENCE" />
            </span>
          }
        />
      </Grid>
      <Grid
        item
        style={{
          marginTop: 40,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AsyncButton
          onClick={() => {
            // check that required fields are complete
            const nextIncompleteFields = schema.filter(
              field =>
                field.required &&
                field.defaultValue === formValues[field.name],
            );
            setIncompleteFields(nextIncompleteFields);

            // check that terms and conditions were accepted
            setTermsError(!acceptedTerms);

            if (nextIncompleteFields.length === 0 && acceptedTerms) {
              console.log('Time to report the sighting');
              setLoading(true);
              setTimeout(() => {
                console.log('Sighting submitted');
                setLoading(false);
              }, 150000);
            }
          }}
          style={{ width: 200 }}
          loading={loading}
          variant="contained"
          color="secondary"
        >
          <FormattedMessage id="REPORT_SIGHTING" />
        </AsyncButton>
      </Grid>
      <Grid style={{ marginTop: 12 }} item>
        {termsError && (
          <Typography color="error">
            <FormattedMessage id="TERMS_ERROR" />
          </Typography>
        )}
        {incompleteFields.map(incompleteField => (
          <Typography key={incompleteField.name} color="error">
            <FormattedMessage
              id="INCOMPLETE_FIELD"
              values={{
                fieldName: intl.formatMessage({
                  id: incompleteField.labelId,
                }),
              }}
            />
          </Typography>
        ))}
      </Grid>
    </Grid>
  );
}
