import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  progressContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.7em',
    fontSize: '0.7em',
  },
  bar: (percent: number) => ({
    flexGrow: '1',
    background: '#626567',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px',
    height: '4px',
    position: 'relative',
    '::before': {
      content: '',
      position: 'absolute',
      top: '0',
      left: '0',
      height: '4px',
      background: 'cyan',
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px',
      borderBottomLeftRadius: '4px',
      borderBottomRightRadius: '4px',
      width: `${percent}%`,
    },
  }),
  num: {
    lineHeight: 1,
  },
})

type Props = {
  percent: number
}

export default function ProgressIndicator({percent}: Props) {
  return (
    <div {...stylex.props(styles.progressContainer)}>
      <div {...stylex.props(styles.bar(percent))} />
      <div {...stylex.props(styles.num)}>{percent}%</div>
    </div>
  )
}
