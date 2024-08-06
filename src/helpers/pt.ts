const TRANSITIONS = {
  overlay: {
    enterFromClass: 'opacity-0 scale-75',
    enterActiveClass: 'transition-transform transition-opacity duration-150 ease-in',
    leaveActiveClass: 'transition-opacity duration-150 ease-linear',
    leaveToClass: 'opacity-0'
  }
}

const OverlayPanelDropdownStyles = {
  root: 'bg-white border border-gray-300 rounded-md'
}

export {
  OverlayPanelDropdownStyles
}
