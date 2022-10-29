import React from 'react';
import styled from 'styled-components';

type FormProps = {
  resolve?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

const FormWrapper = styled.div<{ fullWidth?: boolean; disabled: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '80%' : '200px')};
  background-color: ${({ theme }) => theme.colors.card.default};
  margin-bottom: 2.4rem;
  box-shadow: ${({ theme }) => theme.shadows.default};
  filter: opacity(${({ disabled }) => (disabled ? '.4' : '1')});
  align-self: stretch;
  ${({ theme }) => theme.mediaQueries.small} {
    width: 100%;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
    padding: 1.6rem;
  }
`;

const FormInput = styled.input`
  margin-top: 0.4rem;
  border: 1px solid;
  border-radius: 4px;
`;

export const Form = ({
  resolve = false,
  disabled = false,
  fullWidth,
}: FormProps) => {
  if (resolve) {
    return (
      <FormWrapper fullWidth={fullWidth} disabled={disabled}>
        <label htmlFor="idToResolve"> Input to resolve: </label>
        <FormInput
          type="text"
          name="idToResolve"
          id="idToResolve"
          defaultValue="Twitter username"
        />
      </FormWrapper>
    );
  }
  return null;
};
