import React from 'react'
import { useField, useFormikContext } from 'formik'
import FormControlTextField, {
  FormControlTextFieldProps,
} from './FormControlTextField'
// eslint-disable-next-line import/no-named-as-default
import SingleSelect, { MultiProps, SingleProps } from './SingleSelect'
import { some } from '../utils/constants'

export const FieldTextContent: React.FC<FormControlTextFieldProps> = React.memo(
  (props) => {
    const [field, meta] = useField(props as any)
    const { submitCount } = useFormikContext()
    return (
      <FormControlTextField
        {...field}
        {...props}
        errorMessage={submitCount > 0 && meta.error ? meta.error : undefined}
      />
    )
  },
)

export type SelectProps<T> = MultiProps<T> | SingleProps<T>

export const FieldSelectContent: <T extends some>(
  props: SelectProps<T>,
) => React.ReactElement<SelectProps<T>> = (props) => {
  const [field, meta] = useField(props as any)
  const { submitCount } = useFormikContext()
  return (
    <SingleSelect
      {...field}
      {...props}
      errorMessage={submitCount > 0 && meta.error ? meta.error : undefined}
    />
  )
}
