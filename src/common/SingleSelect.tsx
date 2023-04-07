import React from 'react'
import { useIntl } from 'react-intl'
import { withStyles } from '@mui/styles'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CloseIcon from '@mui/icons-material/Close'
import DoneIcon from '@mui/icons-material/Done'
import { BLUE, BLUE_50 } from '../assets/colors'
import FormControlTextField, {
  FormControlTextFieldProps,
} from './FormControlTextField'

interface CommonProps<T> extends FormControlTextFieldProps {
  getOptionLabel?: (option: T) => string | JSX.Element
  renderValueInput?: (option: T) => string
  valueKey?: (option: T) => any
  disableCloseIcon?: boolean
  options: T[]
  horizontal?: boolean
}
export interface SingleProps<T> extends CommonProps<T> {
  multiple?: false
  value?: any
  onSelectOption?: (value?: any) => void
}
export interface MultiProps<T> extends CommonProps<T> {
  multiple: true
  value?: any[]
  onSelectOption?: (value?: any[]) => void
}

export type SelectProps<T> = MultiProps<T> | SingleProps<T>

export const ListItemStyled = withStyles({
  root: {
    overflow: 'hidden',
    padding: '8px 16px',
    '&:hover': { background: BLUE_50 },
  },
})(ListItem)

export const SingleSelect: React.FC<any> = (props) => {
  const {
    options,
    valueKey,
    getOptionLabel: getLabel,
    renderValueInput,
    multiple,
    onSelectOption,
    id,
    disabled,
    disableCloseIcon,
    value,
    horizontal,
    ...rest
  } = props
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<any>()
  const intl = useIntl()

  const getValueKey = React.useCallback(
    (one: typeof options[number]) => {
      return valueKey ? valueKey(one) : one?.id
    },
    [options, valueKey],
  )

  const getOptionLabel = React.useCallback(
    (one: typeof options[number]) => {
      return getLabel ? getLabel(one) : one.name
    },
    [getLabel, options],
  )
  const isChecked = React.useCallback(
    (one: typeof options[number]) => {
      if (multiple) {
        return value && value?.length > 0
          ? value?.findIndex((v: any) => v === getValueKey(one)) !== -1
          : false
      }
      return value === getValueKey(one)
    },
    [getValueKey, multiple, options, value],
  )

  const onSelectValue = React.useCallback(
    (one: typeof options[number], index?: number) => {
      if (multiple) {
        let tmp: any
        if (isChecked(one)) {
          tmp = value
            ? (v: any) =>
                v !== getValueKey(one).filter((el: any) => el !== value)
            : []
        } else {
          tmp = value ? [...value, getValueKey(one)] : [getValueKey(one)]
        }
        const hasAll = tmp.filter((v: any) => v === undefined)
        const noUndefinedValue = tmp.filter((v: any) => v !== undefined)
        const noUndefinedOptions = options.filter(
          (v: any) => getValueKey(v) !== undefined,
        )
        if (
          hasAll?.length > 0 ||
          (noUndefinedValue?.length === noUndefinedOptions?.length &&
            options?.length !== noUndefinedOptions?.length)
        ) {
          if (onSelectOption) onSelectOption([])
        } else if (onSelectOption) onSelectOption(tmp)
      } else {
        if (onSelectOption) onSelectOption(getValueKey(one))
        setOpen(false)
      }
    },
    [getValueKey, isChecked, multiple, onSelectOption, options, value],
  )

  const getTextInput = React.useMemo(() => {
    if (multiple) {
      if (value && options && value?.length === options.length) {
        return intl.formatMessage({ id: 'all' })
      }
      return value && value.length > 0
        ? options
            .filter((v: any) => value.includes(getValueKey(v)))
            .map((v: any) => getOptionLabel(v))
            .join(', ')
        : ''
    }
    const tmp = options?.find((one: any) => getValueKey(one) === value)
    return tmp && renderValueInput(tmp)
  }, [
    getOptionLabel,
    getValueKey,
    intl,
    multiple,
    options,
    renderValueInput,
    value,
  ])

  const renderClose = React.useCallback(() => {
    if (disableCloseIcon || !open) return null
    if (multiple) {
      if (value && value?.length > 0) {
        return (
          <IconButton
            style={{ padding: 2 }}
            onClick={() => onSelectOption && onSelectOption([])}
          >
            <CloseIcon style={{ height: 23, width: 23 }} />
          </IconButton>
        )
      }
    } else if (value) {
      return (
        <IconButton
          style={{ padding: 2 }}
          onClick={() => {
            if (onSelectOption) onSelectOption(undefined)
          }}
        >
          <CloseIcon style={{ height: 23, width: 23 }} />
        </IconButton>
      )
    }
    return null
  }, [disableCloseIcon, open, multiple, value, onSelectOption])

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div>
        <FormControlTextField
          {...rest}
          id={id}
          readOnly
          // horizontal
          focused={open}
          disabled={disabled}
          value={getTextInput || ''}
          inputRef={inputRef}
          endAdornment={
            <InputAdornment position="end">
              {renderClose()}
              <IconButton style={{ padding: 2, marginRight: 6 }}>
                <ArrowDropDownIcon
                  style={{ transform: open ? 'rotate(180deg)' : undefined }}
                />
              </IconButton>
            </InputAdornment>
          }
          inputProps={{
            ...rest.inputProps,
            style: { textOverflow: 'ellipsis', ...rest.inputProps?.style },
          }}
          onClick={() => !disabled && setOpen(true)}
        />
        <Popper
          open={open}
          anchorEl={inputRef?.current}
          style={{
            width: inputRef?.current?.offsetWidth,
            margin: '4px 0',
            zIndex: 2147483638,
          }}
          placement="bottom"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper style={{ maxHeight: 300, overflowY: 'auto' }}>
                <List>
                  {multiple && (
                    <ListItemStyled
                      role={undefined}
                      dense
                      onClick={() => {
                        if (multiple) {
                          if (value?.length === options.length) {
                            if (onSelectOption) onSelectOption([])
                          } else if (onSelectOption)
                            onSelectOption(
                              options.map((v: any) => getValueKey(v)),
                            )
                        }
                      }}
                      style={{
                        background:
                          value?.length === options.length
                            ? BLUE_50
                            : undefined,
                      }}
                    >
                      <Typography
                        variant="body2"
                        style={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          flex: 1,
                        }}
                      >
                        {intl.formatMessage({ id: 'all' })}
                      </Typography>
                      <DoneIcon
                        style={{
                          opacity: 0.6,
                          width: 18,
                          height: 18,
                          visibility:
                            value?.length === options.length
                              ? 'visible'
                              : 'hidden',
                          color: BLUE,
                          justifySelf: 'flex-end',
                        }}
                      />
                    </ListItemStyled>
                  )}
                  {options?.length > 0 &&
                    options.map(
                      (one: typeof options[number], index: number) => (
                        <ListItemStyled
                          // eslint-disable-next-line react/no-array-index-key
                          key={index}
                          role={undefined}
                          dense
                          onClick={() => onSelectValue(one, index)}
                          style={{
                            cursor: 'pointer',
                            background: isChecked(one) ? BLUE_50 : undefined,
                          }}
                        >
                          <Typography
                            variant="body2"
                            component={'span'}
                            style={{
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}
                          >
                            {getOptionLabel && getOptionLabel(one)}
                          </Typography>
                          <DoneIcon
                            style={{
                              marginLeft: 5,
                              opacity: 0.6,
                              width: 18,
                              height: 18,
                              visibility: isChecked(one) ? 'visible' : 'hidden',
                              color: BLUE,
                              justifySelf: 'flex-end',
                            }}
                          />
                        </ListItemStyled>
                      ),
                    )}
                </List>
              </Paper>
            </Fade>
          )}
        </Popper>
      </div>
    </ClickAwayListener>
  )
}

export default SingleSelect
