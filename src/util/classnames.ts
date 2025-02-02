function classnames(...names: (string | undefined | boolean | number)[]) {
  return names.filter(Boolean).join(' ')
}

export default classnames
