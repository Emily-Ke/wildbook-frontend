import React, { useRef } from 'react';
import { useTheme } from '@material-ui/core/styles';
import BboxAnnotator from 'bboxjs';

export default function AnnotationEditor({ id, imgSrc, onChange }) {
  const div = useRef(null);
  const theme = useTheme();

  /* eslint-disable */
  if (div && div.current) {
    new BboxAnnotator(imgSrc, {
      prefix: `${id}-`,
      mode: 'rectangle',
      modes: 'rectangle',
      colors: {
        default: theme.palette.secondary.main,
        hover: '#5815b0',
        focus: theme.palette.secondary.dark,
        anchor: theme.palette.primary.main,
      },
      actions: {
        entry: {
          parts: false,
        },
      },
      callbacks: {
        onchange: onChange,
      },
    });
  }
  /* eslint-enable */

  return (
    <div
      id={`${id}bbox-annotator-container`}
      style={{ width: '100%', zIndex: 999999 }}
      ref={div}
    />
  );
}
