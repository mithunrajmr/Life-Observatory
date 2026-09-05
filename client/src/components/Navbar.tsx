// Shared tab identifiers for the Observatory's tab-based navigation.
// The former dark-theme <Navbar> component was retired in favour of the
// editorial <Sidebar> + mobile bottom nav; only this type is still shared.
export type TabType =
  | 'observatory'
  | 'talk'
  | 'timeline'
  | 'insights'
  | 'goals'
  | 'connections'
  | 'journal';
