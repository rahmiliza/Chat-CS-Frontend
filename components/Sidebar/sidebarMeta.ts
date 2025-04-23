export interface Section {
  label: string;
  icon: string;
  links: Link[];
}

export interface Link {
  label: string;
  to: string;
  icon?: string;
}
