import React from 'react';

export default function InlineButton({
  children,
  style = {},
  ...rest
}) {
  return (
    <button
      style={{
        border: 'unset',
        textDecoration: 'underline',
        cursor: 'pointer',
        padding: 0,
        ...style,
      }}
      type="button"
      {...rest}
    >
      {children}
    </button>
  );
}
